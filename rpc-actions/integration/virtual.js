function toActionProxy(actionCallback = {}, aggregatedPath = "/_actions/") {
  return new Proxy(actionCallback, {
    get(target, objKey) {
      const path = aggregatedPath + objKey.toString();
      if (objKey in target) {
        return target[objKey];
      }
      async function action(param) {
        const headers = new Headers();
        headers.set("Accept", "application/json");
        let body = param;
        if (!(body instanceof FormData)) {
          body = JSON.stringify(param);
          headers.set("Content-Type", "application/json");
        }
        const res = await fetch(path, {
          method: "POST",
          body,
          headers,
        });
        return res.json();
      }
      action.toString = () => path;
      action[Symbol.toPrimitive] = () => path;
      // recurse to construct queries for nested object paths
      // ex. actions.user.admins.auth()
      return toActionProxy(action, path + ".");
    },
  });
}

export const actions = toActionProxy();
