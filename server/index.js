const { ApolloServer, gql, PubSub } = require("apollo-server");

const pubsub = new PubSub();

const chatMessages = [
  {
    message: "Harry Potter and the Chamber of Secrets",
    author: "J.K. Rowling"
  },
  {
    message: "Jurassic Park",
    author: "Michael Crichton"
  }
];

const typeDefs = gql`
  type Subscription {
    chatMessageSent: ChatMessage
  }

  type Mutation {
    sendChatMessage(author: String, message: String): ChatMessage
  }

  type ChatMessage {
    message: String
    author: String
  }

  type Query {
    chatMessages: [ChatMessage]
  }
`;

const CHAT_MESSAGE_SENT = "CHAT_MESSAGE_SENT";

const resolvers = {
  Subscription: {
    chatMessageSent: {
      subscribe: () => pubsub.asyncIterator([CHAT_MESSAGE_SENT])
    }
  },
  Query: {
    chatMessages: () => chatMessages
  },
  Mutation: {
    sendChatMessage(root, args, context) {
      pubsub.publish(CHAT_MESSAGE_SENT, { chatMessageSent: args });
      chatMessages.push(args);
      return args;
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log("Server is ready at " + url);
});
