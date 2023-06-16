import * as Ably from "ably";

const ABLY_API_KEY = process.env.REACT_APP_ABLY_API_KEY;

const useAbly = (() => {
  let channel = null;

  return (channelId) => {
    const setChannelId = async (channelId) => {
      const channelName = `BizBuz/${channelId}`;
      if (!channel || channel.name !== channelName) {
        const ablyClient = new Ably.Realtime.Promise(ABLY_API_KEY);
        channel = ablyClient.channels.get(channelName);
        await channel.attach();
      }
    };

    if (channelId) {
      setChannelId(channelId);
    }

    const publish = async (message) => {
      await channel.publish({ data: message });
    };

    const getMembers = async () => {
      return await channel.presence.get();
    };

    const addMember = async (clientId, data) => {
      await channel.presence.enterClient(clientId, data);
    };

    const removeMember = async (clientId) => {
      await channel.presence.leaveClient(clientId);
    };

    const onMemberUpdate = async (callback) => {
      await channel.presence.subscribe("enter", callback);
    };

    const subscribe = async (listener) => {
      await channel.subscribe(listener);
    };

    const unSubscribe = () => {
      channel.presence.unsubscribe();
      channel.unsubscribe();
    };

    const detach = async () => {
      await channel.detach();
      await channel.release();
    };

    return {
      setChannelId,
      publish,
      subscribe,
      addMember,
      removeMember,
      getMembers,
      onMemberUpdate,
      unSubscribe,
      detach,
    };
  };
})();

export default useAbly;
