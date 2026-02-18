import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

// Verify webhook signature from Freemius
function verifySignature(body: string, signature: string | null): boolean {
  if (!signature) {
    console.log("❌ No signature header found");
    return false;
  }

  const secretKey = process.env.FREEMIUS_SECRET_KEY;
  if (!secretKey) {
    console.log("❌ FREEMIUS_SECRET_KEY not configured");
    return false;
  }

  // Compute HMAC-SHA256 of the body using secret key
  const computedSignature = createHmac("sha256", secretKey)
    .update(body)
    .digest("hex");

  console.log("🔐 Signature Verification:");
  console.log("   Received:", signature);
  console.log("   Computed:", computedSignature);

  // Use timing-safe comparison to prevent timing attacks
  try {
    const sigBuffer = Buffer.from(signature, "hex");
    const computedBuffer = Buffer.from(computedSignature, "hex");

    if (sigBuffer.length !== computedBuffer.length) {
      console.log("❌ Signature length mismatch");
      return false;
    }

    const isValid = timingSafeEqual(sigBuffer, computedBuffer);
    console.log("   Valid:", isValid ? "✅ YES" : "❌ NO");
    return isValid;
  } catch {
    console.log("❌ Signature comparison failed");
    return false;
  }
}

// Freemius webhook events we care about
type FreemiusEvent =
  | "subscription.created"
  | "subscription.cancelled"
  | "subscription.renewal.failed.last"
  | "subscription.renewal.retry"
  | string;

interface FreemiusWebhookPayload {
  id: string;
  type: FreemiusEvent;
  data: {
    id: string;
    user_id: string;
    plan_id: string;
    pricing_id: string;
    billing_cycle: number; // 1 = monthly, 3 = quarterly, 12 = yearly
    next_payment?: string;
    canceled_at?: string;
    created_at: string;
    user?: {
      id: string;
      email: string;
      first?: string;
      last?: string;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get("x-signature");

    console.log("===========================================");
    console.log("FREEMIUS WEBHOOK RECEIVED");
    console.log("===========================================");

    // Verify signature
    if (!verifySignature(body, signature)) {
      console.log("❌ INVALID SIGNATURE - Rejecting webhook");
      // Return 200 to not expose info to attackers
      return NextResponse.json({ received: true });
    }

    console.log("✅ SIGNATURE VERIFIED");

    const payload = JSON.parse(body) as FreemiusWebhookPayload;

    // Debug logging
    console.log("Event Type:", payload.type);
    console.log("Event ID:", payload.id);
    console.log("Full Payload:", JSON.stringify(payload, null, 2));
    console.log("===========================================");

    const { type, data } = payload;

    switch (type) {
      case "subscription.created": {
        console.log("📦 SUBSCRIPTION CREATED");
        console.log("User ID:", data.user_id);
        console.log("User Email:", data.user?.email);
        console.log("Plan ID:", data.plan_id);
        console.log("Billing Cycle:", data.billing_cycle, "months");
        console.log("Next Payment:", data.next_payment);

        // TODO: Update user in Strapi
        // await updateUserSubscription({
        //   email: data.user?.email,
        //   plan: getPlanFromPlanId(data.plan_id),
        //   billing_period: getBillingPeriod(data.billing_cycle),
        //   subscription_status: "active",
        //   subscription_end_date: data.next_payment,
        //   freemius_subscription_id: data.id,
        // });

        break;
      }

      case "subscription.cancelled": {
        console.log("❌ SUBSCRIPTION CANCELLED");
        console.log("User ID:", data.user_id);
        console.log("User Email:", data.user?.email);
        console.log("Cancelled At:", data.canceled_at);
        console.log("Still Active Until:", data.next_payment);

        // TODO: Update user in Strapi - mark as cancelled but keep active until end date
        // await updateUserSubscription({
        //   email: data.user?.email,
        //   subscription_status: "cancelled",
        //   // Keep plan active until subscription_end_date
        // });

        break;
      }

      case "subscription.renewal.failed.last": {
        console.log("💀 SUBSCRIPTION ENDED - FINAL RENEWAL FAILED");
        console.log("User ID:", data.user_id);
        console.log("User Email:", data.user?.email);

        // TODO: Update user in Strapi - set to free
        // await updateUserSubscription({
        //   email: data.user?.email,
        //   plan: "free",
        //   subscription_status: "expired",
        //   billing_period: null,
        //   freemius_subscription_id: null,
        // });

        break;
      }

      case "subscription.renewal.retry": {
        console.log("🔄 SUBSCRIPTION RENEWAL RETRY");
        console.log("User ID:", data.user_id);
        console.log("User Email:", data.user?.email);
        // Just log, no action needed yet
        break;
      }

      default: {
        console.log("ℹ️ UNHANDLED EVENT TYPE:", type);
        break;
      }
    }

    return NextResponse.json({ received: true, type });
  } catch (error) {
    console.error("❌ WEBHOOK ERROR:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Helper functions - uncomment and implement when ready

// function getPlanFromPlanId(planId: string): "champion" | "premium" {
//   // Map Freemius plan IDs to your plan names
//   const planMap: Record<string, "champion" | "premium"> = {
//     "40816": "champion", // Update with your actual plan IDs
//     "40817": "premium",
//   };
//   return planMap[planId] || "champion";
// }

// function getBillingPeriod(billingCycle: number): "1month" | "3months" | "12months" {
//   switch (billingCycle) {
//     case 1: return "1month";
//     case 3: return "3months";
//     case 12: return "12months";
//     default: return "1month";
//   }
// }

// async function updateUserSubscription(data: {
//   email?: string;
//   plan?: string;
//   billing_period?: string | null;
//   subscription_status?: string;
//   subscription_end_date?: string;
//   freemius_subscription_id?: string | null;
// }) {
//   // Call Strapi API to update user
//   const response = await fetch(`${process.env.STRAPI_URL}/api/users/update-subscription`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Authorization": `Bearer ${process.env.STRAPI_API_TOKEN}`,
//     },
//     body: JSON.stringify(data),
//   });
//   return response.json();
// }
