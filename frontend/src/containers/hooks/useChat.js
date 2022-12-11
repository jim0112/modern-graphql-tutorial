import { createContext, useContext, useState, useEffect } from "react";
import { message } from "antd";
import { useQuery, useMutation } from "@apollo/client";
import { CHATBOX_QUERY, CREATE_CHATBOX_MUTATION, CREATE_MESSAGE_MUTATION, MESSAGE_SUBSCRIPTION } from "../../graphql";

const LOCALSTORAGE_KEY = "save-me";
const savedMe = localStorage.getItem(LOCALSTORAGE_KEY);
const ChatContext = createContext({
    status: {},
    me: "",
    signedIn: false,
    messages: [],
    sendMessage: () => {},
});

const ChatProvider = (props) => {

    const [startChat] = useMutation(CREATE_CHATBOX_MUTATION);
    const [sendMessage] = useMutation(CREATE_MESSAGE_MUTATION);
    const [messages, setMessages] = useState([]);
    const [me, setMe] = useState(savedMe || "");
    const [friend, setFriend] = useState("");
    const [signedIn, setSignedIn] = useState(false);
    const [status, setStatus] = useState({});
    const { data, loading, subscribeToMore } = useQuery(CHATBOX_QUERY, {
        variables: {
            name1: me,
            name2: friend,
        },
    });

    const displayStatus = (s) => {
        if (s.msg) {
          const { type, msg } = s;
          const content = { content: msg, duration: 0.5 }
          switch (type) {
            case 'success':
              message.success(content)
              break
            case 'error':
            default:
              message.error(content)
              break
          }
        }
    }
    useEffect(() => {
        if(data && !loading){
            setMessages(data.chatbox.messages);
        }
    }, [loading]);

    useEffect(() => {
        try {
            subscribeToMore({
                document: MESSAGE_SUBSCRIPTION,
                variables: { from: me, to: friend },
                updateQuery: (prev, { subscriptionData }) => {
                    if (!subscriptionData.data) return prev;
                    const newMessage = subscriptionData.data.message.message;
                    return {
                        chatBox: {
                            messages: [...prev.chatBox.messages, newMessage],
                        },
                    };
                },
            });
        } catch (e) {}
    }, [subscribeToMore]);

    useEffect(() => {
        if(signedIn){
            localStorage.setItem(LOCALSTORAGE_KEY, me);
        }
    }, [signedIn]);

    return (
        <ChatContext.Provider
          value={{
            status,
            friend,
            me,
            signedIn,
            messages,
            setMe,
            setFriend,
            setSignedIn,
            sendMessage,
            displayStatus,
            startChat
          }}
          {...props}
        />
    );
};

const useChat = () => useContext(ChatContext);
export { ChatProvider, useChat};