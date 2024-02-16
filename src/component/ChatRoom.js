import React, { useState } from 'react';
import {over} from 'stompjs'
import SockJS from 'sockjs-client';

const ChatRoom = () => {
    const [publicChats, setpublicChats] = useState([])
    const [privateChats, setPrivateChats] = useState(new Map());
    const [tab,settab]= useState("CHATROOM");
    const [userData, setUserData] = useState({
        username:"",
        receivername:"",
        connected:false,
        message:""
    })

    const handleUserName =(event)=>{
        const {value}=event.target;
        setUserData({...userData,"username":value});
    }

    const registerUser =()=>{
        let Sock=new SockJS('http://localhost:8080/ws');
        stompClient=over(Sock)
        stompClient.connect({},onConnected,onError);
    }

    const onConnected =()=>{
        setUserData({...userData,"connected":true});
        stompClient.subscribe('/chatroom/public',onPublicMessageReceived);
        stompClient.subscribe('/user'+userData.username+'/private',onPrivateMessageReceived);

    }

    const onPublicMessageReceived =(payload) =>{
        let payloadData=JSON.parse(payload.body);
        switch (payloadData.status) {
            case "JOIN":
                if(!privateChats.get(payloadData.senderName)){
                    privateChats.set(payloadData.senderName,[]);
                    setPrivateChats(new Map(privateChats));}    
                break;
            case "MESSAGE":
                publicChats.push(payloadData);
                setpublicChats({...publicChats})
                break;
        }
    }

    const onError=(err)=>{
        console.log(err);
    }

    const onPrivateMessageReceived =(payload)=>{
        let payloadData=JSON.parse(payload);
        if(privateChats.get(payloadData.senderName)){
            privateChats.get(payloadData.senderName).push(payloadData);
            setPrivateChats(new Map(privateChats));

        }else{
            let list=[];
            list.push(payloadData);
            privateChats.set(payloadData.senderName,list);
            setPrivateChats(new Map(privateChats));

        }

    }

  return (
    <div className='container'>
        {userData.connected?
        <div className='chat-box'>
            <div className='member-list'>
                <ul>
                    <li onClick={()=>{settab("CHATROOM")}} className={`member ${tab==="CHATROOM" && "active"}`}>Chatroom</li>
                    {[...privateChats.keys()].map((name,index)=>(
                        <li  onClick={()=>{settab(name)}} className={`member ${tab===name && "active" }`} key={index}>
                            {name}
                        </li>
                    ))

                    }
                </ul>
            </div>
            {tab=== "CHATROOM" && <div className='chat-content'>
                <ul className='chat-messages'>

                    {publicChats.map((chat,index)=>(
                        <li className='member' key={index}>
                           {chat.senderName !==userData.username && <div className='avatar'>{chat.senderName}</div>}
                           <div className='message-data'>
                            {chat.message}
                           </div>
                            {chat.senderName===userData.username && <div className='avatar self'>{chat.senderName}</div>}
                        </li>
                    ))

                    }
                    </ul>
                    <div className='send-message'>
                        <input type="text" className='input-message' placeholder='enter public message' value={userData.message}
                        onChange={handleMessage} />
                        <button type='button' className='send-button' onclick={sendPublicMessage}>send</button>

                    </div>
                
            </div>}

            {tab!== "CHATROOM" && <div className='chat-content'>
                <ul className='chat-messages'>

                    {[...privateChats.get(tab)].map((chat,index)=>(
                        <li className='member' key={index}>
                           {chat.senderName !==userData.username && <div className='avatar'>{chat.senderName}</div>}
                           <div className='message-data'>
                            {chat.message}
                           </div>
                            {chat.senderName===userData.username && <div className='avatar self'>{chat.senderName}</div>}
                        </li>
                    ))

                    }
                    </ul>
                    <div className='send-message'>
                        <input type="text" className='input-message' placeholder={`enter private message for ${tab}`} value={userData.message}
                        onChange={handleMessage} />
                        <button type='button' className='send-button' onclick={sendPrivateMessage}>send</button>

                    </div>
                
            </div>}
        </div>:
        <div className='register'>
                      <input id='user-name'
                          placeholder='Enter the user name'
                          value={userData.username}
                          onChange={handleUserName} />
                      <button type='button' onClick={registerUser}>connect</button>
        </div>}
    </div>
  )
}

export default ChatRoom