module.exports = async (query, config, tb) => { 
  const { sid } = query;
  if (!sid) return {
    status: 403,
    data: { success: false, error: "need sid" }
  };

  try {
    const userOrigin = await tb.get('userSid', [{ sid }]);
    return await tb.get('userList', [{type: userOrigin.type}, {typeId: userOrigin.typeId}]);
  } catch (e) {
    return {
      status: 500,
      data: e.message
    };
  }
}