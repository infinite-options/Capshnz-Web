import Ably from "ably/callbacks";

const ABLY_API_KEY = process.env.REACT_APP_ABLY_API_KEY;

const useAbly = (() => {
  let channel = null;

  return (channelId) => {
    const setChannelId = (channelId) => {
      const channelName = `BizBuz/${channelId}`;
      if (!channel || channel.name !== channelName) {
        const ably = new Ably.Realtime(ABLY_API_KEY);
        channel = ably.channels.get(channelName);
        channel.attach((err) => {
          if (err) console.error("Error when attaching: " + err.message);
        });
      }
    };

    if (channelId) {
      setChannelId(channelId);
    }

    const publish = (message) => {
      channel.publish({ data: message }, (err) => {
        if (err) console.error("Error when publishing: " + err.message);
      });
    };

    const getMembers = (callback) => {
      channel.presence.get((err, members) => {
        if (err) console.error("Error when getting members: " + err.message);
        else callback(members);
      });
    };

    const addMember = (clientId, data) => {
      channel.presence.enterClient(clientId, data, (err) => {
        if (err) console.error("Error when entering: " + err.message);
      });
    };

    const removeMember = (clientId) => {
      channel.presence.leaveClient(clientId, (err) => {
        if (err) console.error("Error when leaving: " + err.message);
      });
    };

    const onMemberUpdate = (callback) => {
      channel.presence.subscribe(["enter"], callback);
    };

    const subscribe = (listener) => {
      channel.subscribe(listener);
    };

    const unSubscribe = () => {
      channel.presence.unsubscribe();
      channel.unsubscribe();
    };

    const detach = () => {
      channel.detach((err) => {
        if (err) console.error("Error when detaching: " + err.message);
        else channel.release();
      });
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
