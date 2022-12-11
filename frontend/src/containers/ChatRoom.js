import { Input, Tabs } from 'antd'
import { useState, useEffect, useRef } from 'react'
import { useChat } from './hooks/useChat'
import styled from "styled-components"
import Message from './Message'
import Title from '../components/Title'
import ChatModal from '../components/ChatModal'

const ChatBoxesWrapper = styled(Tabs)`
    width: 100%;
    height: 300px;
    background: #eeeeee52;
    border-radius: 10px;
    margin: 20px;
    padding: 20px;
    overflow: auto;
`;
const ChatBoxWrapper = styled.div`
    width: 100%;
    height: 300px;
    background: #eeeeee52;
    border-radius: 10px;
    margin: 20px;
    padding: 20px;
    overflow: auto;
`;

const FootRef = styled.div`
    height: 20px;
`;

const ChatRoom = () => {
    const { me, messages, sendMessage, setFriend, startChat, displayStatus } = useChat();
    const [chatBoxes, setChatBoxes] = useState([]);
    const [activeKey, setActiveKey] = useState('');
    // const [username, setUsername] = useState('');
    const [msg, setMsg] = useState('');
    const [msgSent, setMsgSent] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    // const msgRef = useRef(null);
    const msgFooter = useRef(null);

    const displayMessages = (chat) => {
        return (
            chat.length === 0 ? (
                <p style={{ color: '#ccc' }}> No messages... </p>
            ) : (
                chat.map(({ sender, body }, i) => (
                    <Message name={sender} isMe={sender === me} message={body} key={i} />
                ))
            )
        )
    };
    const scrollToBottom = () => {
        msgFooter.current?.scrollIntoView(
            { behavior: 'smooth', block: 'start' }
        );
    };
    useEffect(() => {
        scrollToBottom();
        setMsgSent(false);
    }, [msgSent]);

    const renderChat = (chat) => {
        return (
            <ChatBoxWrapper>
                {displayMessages(chat)}
                <FootRef ref={msgFooter} />
            </ChatBoxWrapper>  
        )
    };
    
    const createChatBox = (friend) => {
        if (chatBoxes.some(({ key }) => key === friend)) {
            throw new Error(friend + "'s chat box has already opened.");
        }
        const chat = renderChat(messages);
        setChatBoxes([...chatBoxes, { label: friend, children: chat, key: friend }]);
        setMsgSent(true);
        return friend;
    };
    const removeChatBox = (targetKey, activeKey) => {
        const index = chatBoxes.findIndex(({ key }) => key === activeKey);
        const newChatBoxes = chatBoxes.filter(({ key }) => key !== targetKey);
        setChatBoxes(newChatBoxes);
        return (
            activeKey ? activeKey === targetKey ?
                index === 0 ? '' : chatBoxes[index - 1].key : activeKey : ''
        );
    };
    const handleChatBox = (friend) => {
        const index = chatBoxes.findIndex(({ key }) => key === activeKey);
        const chat = renderChat(messages);
        let newChatBoxes = [...chatBoxes];
        newChatBoxes[index] = { label: friend, children: chat, key: friend };
        setChatBoxes(newChatBoxes);
    }
    useEffect(() => {
        handleChatBox(activeKey);
    }, [messages])

    return (
      <>
        <Title name={me} />
        <>
            <ChatBoxesWrapper 
                tabBarStyle={{ height: '36px' }}
                type="editable-card"
                activeKey={activeKey}
                onChange={async (key) => {
                    setActiveKey(key);
                    setFriend(key);
                    await startChat({
                        variables: { name1: me, name2: key },
                    });
                }}
                onEdit={(targetKey, action) => {
                    if (action === 'add') setModalOpen(true);
                    else if (action === 'remove'){
                        setActiveKey(removeChatBox(targetKey, activeKey));
                        setFriend(activeKey);
                    }  
                }}
                items={chatBoxes}
            />
            <ChatModal
                open={modalOpen}
                onCreate={ async ({ name }) => {
                    await startChat({
                        variables: { name1: me, name2: name },
                    });
                    setActiveKey(createChatBox(name));
                    setFriend(name);
                    setModalOpen(false);
                }}
                onCancel={() => {
                    setModalOpen(false);
                }}
            />
            <Input.Search
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                enterButton="Send"
                placeholder="Type a message here..."
                onSearch={(msg) => {
                    if (!msg) {
                        displayStatus({
                            type: 'error',
                            msg: 'Please enter a message body.'
                        });
                        return;
                    }
                    sendMessage({ variables: { name: me, to: activeKey, body: msg } });
                    setMsg('');
                    setMsgSent(true);
                }}
            ></Input.Search>
        </> 
      </>
    )
  }
  
  export default ChatRoom