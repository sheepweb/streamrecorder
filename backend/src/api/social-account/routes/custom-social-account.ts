export default {
  routes: [
    {
      method: "POST",
      path: "/social-auth/login",
      handler: "social-account.login",
      config: { auth: false },
    },
    {
      method: "GET",
      path: "/social-accounts/me",
      handler: "social-account.meFind",
    },
    {
      method: "POST",
      path: "/social-accounts/me",
      handler: "social-account.meCreate",
    },
    {
      method: "PUT",
      path: "/social-accounts/me/:id",
      handler: "social-account.meUpdate",
    },
    {
      method: "DELETE",
      path: "/social-accounts/me/:id",
      handler: "social-account.meDelete",
    },
  ],
};
