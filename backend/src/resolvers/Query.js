const makeName = (name, to) => { return [name, to].sort().join('_'); };
const Query = {
  chatbox: async (parent, { name1, name2 }, { ChatBoxModel }) => {
    let name = makeName(name1, name2);
    let box = await ChatBoxModel.findOne({ name });
    if (!box)
      box = await new ChatBoxModel({ name }).save();
    return box;
  }
};

export { Query as default };
