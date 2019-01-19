const Axios = require('axios');

module.exports = async (query, config, tb) => {
  const { code, state } = query;
  const response = await Axios.post('https://github.com/login/oauth/access_token', {
    client_id: config.githubClientId,
    client_secret: config.githubClientSecret,
    code
  });

  const data = /access_token=(.*?)&/.exec(response.data || '');
  if (!data || !data[1]) return {
    status: 401,
    data: { success: false, error: "Get access token error" }
  };

  const userResp = await Axios.get('https://api.github.com/user?access_token=' + data[1]);
  
  if (!userResp || !userResp.data) return {
    status: 401,
    data: { success: false, error: "Access token error, please try again!" }
  };

  const userData = userResp.data;

  const sid = await tb.getSid('github', userData.id + '');

  try {
    await tb.put('userList', [
      { type: 'github' },
      { typeId: userData.id + '' }
    ], [
      { 'userName': userData.name || '' },
      { 'account': userData.login || '' },
      { 'avatar': userData.avatar_url || '' },
      { 'email': userData.email || '' },
      { 'home': userData.html_url || '' },
      { 'desc': userData.bio || '' }
    ]);
    
    if (state) {
      const newState = state + (state.indexOf('?') != -1 ? '&nipsid=' : '?nipsid=') + sid;
      return {
        header: {
          'Location': newState,
        },
        status: 302,
        data: 'redirecting...'
      }
    }
  
    return {
      data: `welcome ${userData.name}(${userData.login})! sid: ${sid}`
    };
  } catch (e) {
    return {
      status: 500,
      data: e.message
    };
  }
}