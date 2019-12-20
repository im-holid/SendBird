import React,{Component} from 'react'
import {View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions, ScrollView} from 'react-native'
import SendBird from 'sendbird'
import {NavigationEvents} from 'react-navigation'
  
const width = Dimensions.get('screen').width
const height= Dimensions.get('screen').height

class Login extends Component {
    constructor(props){
        super(props)
        this.sb             = null
        this.groupChannel   = null
        this.messageQuery   = null
        this.state={
            load        : false,
            messageList : [],
            message     : ''
        }
    }

    instanceSendbird=(sb)=>{ //assign to sendbird js
        if(sb == null){
            return new Promise((resolve, reject)=>{
                resolve(sb = new SendBird({appId:'BB294A9F-716E-4D66-AA81-06AE5CDC7B1B'}))
                reject('cant find sendbird')
            })
        }else{
            return new Promise((resolve, reject)=>{
                resolve(sb)
            })
        }
    }

    connectSendBird=(sb)=>{ //connect to sendbird
        return new Promise((resolve, reject)=>{
            if(sb){
                sb.connect('ABCD',(user, error)=>{
                    if(user){
                        user.createMetaData({'role':'dokter.lms'},(metadata,error)=>{
                            if(error){
                                user.createMetaData({'role':'dokter.lms'},(metadata,error)=>{
                                    if(metadata===null){
                                        resolve(sb)
                                    }
                                })
                            }
                            !error?resolve(sb):null
                        })
                    }
                })
            }else reject('sb Null')
        })
    }

    updateNickName=(sb)=>{ //only update it's nickname
        return new Promise((resolve, reject)=>{
            sb.updateCurrentUserInfo('NICKNAME', null,(response, error)=>{
                if(response){
                    resolve(sb)
                }else reject('NickName not updated')
            });
        })
    }

    storeSendBird=(sb)=>{ //storing sendbird value to local variable
        return new Promise((resolve, reject)=>{
            if(this.sb==null){
                this.sb = sb
                this.sb?resolve(this.sb):null
            }else{
                resolve(this.sb)
            }
        })
    }

    createGroup=(sb)=>{ //create group with static data user
        return new Promise((resolve, reject)=>{
            if(sb){
                var userIds = ['10','ABCD']
                        sb.GroupChannel.createChannelWithUserIds(userIds, true, sb.currentUser.nickname, null, null,(groupChannel, error)=>{
                            if(groupChannel){
                                resolve(groupChannel)
                            }
                        })
            }else reject('data null')
        })
    }

    storeGroup=(group)=>{ //storing group value to local variable
        return new Promise((resolve, reject)=>{
            if(this.groupChannel==null){
                this.groupChannel=group
                this.groupChannel?resolve(this.groupChannel):null
            }else resolve(this.groupChannel)
        })
    }

    messageReceived=()=>{ //handler for onMessageReceived
        if(this.sb){
            var ChannelHandler = new this.sb.ChannelHandler()
            ChannelHandler.onMessageReceived = (channel, message)=>{
                this.setState({messageList:[...this.state.messageList,message]})
                console.log(this.state.messageList)
            };
            this.sb.addChannelHandler('messageReceived', ChannelHandler);
        }
    }

    loadPrevMessage=(group, init=false)=>{  //method to load older message if init==true it's assign new value to local variable this.messageQuery
        if(this.messageQuery==null&&init){
            this.messageQuery = group.createPreviousMessageListQuery()
        }
        if(this.messageQuery){
            return new Promise((resolve,reject)=>{
                if(this.messageQuery.hasMore){
                    this.messageQuery.load(5,false,(messages, error)=>{
                        console.log(messages)
                        error?reject(error):resolve(messages)
                    })
                }else resolve([])
            })
        }
    }

    sendMessage=(data)=>{ //method for send message
        if(data!=''){
            return new Promise((resolve, reject)=>{
            const params = new this.sb.UserMessageParams()
            params.message = data;
            params.pushNotificationDeliveryOption = 'default';  // Either 'default' or 'suppress' 
            this.groupChannel.sendUserMessage(params, (message, error)=>{
                if(message){
                    resolve(message)
                }else if(error){
                    reject(true)
                }
            });
            })
        }else{
            return new Promise((resolve,reject)=>{
                reject(true)
            })
        }
    }

    firstMount=()=>{ //same like componentDidMount but it will call this function everytime screen loaded using react-navigation
        this.setState({load:false})
                this.instanceSendbird(this.sb).then((sb)=>{
                    return this.connectSendBird(sb)
                }).then((sb)=>{
                    return this.updateNickName(sb)
                }).then((sb)=>{
                    return this.storeSendBird(sb)
                }).then((sb)=>{
                    return this.createGroup(sb)
                }).then((group)=>{
                    this.messageReceived()
                    return this.storeGroup(group)
                }).then((group)=>{
                    return this.loadPrevMessage(group, true)
                }).then((messages)=>{
                    messages.map((message,index)=>{
                        this.setState({messageList : [...this.state.messageList,message]})
                    })
                })
    }

    render(){
        return(
            <View style={styles.container} >
                <NavigationEvents 
                    onDidFocus={()=>{
                        this.firstMount()
                    }}
                />
                <TouchableOpacity 
                    //For load older message, just to make it as simple as possible
                    style={{
                        justifyContent  :   'center',
                        backgroundColor :   '#00aa00',
                        paddingVertical :   20,
                        borderRadius    :   10
                    }}
                    onPress={()=>{
                        this.loadPrevMessage(false,false).then((result)=>{
                            var data = result.reverse()
                            data.map((data, index)=>{
                                this.setState({messageList:[data,...this.state.messageList]})
                            })
                            console.log(this.state.messageList)
                        })
                    }}
                >
                    <Text
                        style={{
                            textAlign   :   'center'
                        }}
                    >
                        Load Message
                    </Text>
                </TouchableOpacity>
               <ScrollView
                style={{
                    height              :   height*0.6,
                    paddingHorizontal   :   width*0.01
                }}
               >
                   {this.state.messageList.length==0?null:(
                       this.state.messageList.map((data, index)=>(
                        <View
                            key={index}
                            style={[(data._sender.userId=='10')?{
                                alignSelf       :   'flex-start',
                                backgroundColor :   '#fff',
                                paddingRight    :   width*0.1

                            }:{
                                alignSelf       :   'flex-end',
                                backgroundColor :   'rgba(0,255,0,0.3)',
                                paddingLeft     :   width*0.1
                            },
                            {
                                marginVertical      :   height*0.01,
                                paddingHorizontal   :   width*0.025   
                            }
                            ]}
                        >
                            <Text>
                                {data.message}
                            </Text>
                        </View>
                       ))
                   )}
               </ScrollView>
               <View
                style={{
                    height          :   height*0.05,
                    flexDirection   :   'row'
                }}
               >
                    <View
                        style={{
                            flex        :   8,
                            borderWidth :   1
                        }}
                    >
                        <TextInput 
                            placeholder="Send Message"
                            onChangeText={(text)=>{
                                this.setState({message : text})
                            }}
                            ref={input=>this.textInput=input}
                        />
                    </View>
                    <TouchableOpacity
                        //sendMessage button function
                        style={{
                            flex            :   2,
                            backgroundColor :   'rgba(0,0,255,0.5)',
                            borderRadius    :   10,
                            justifyContent  :   'center'
                        }}
                        onPress={()=>{
                            this.sendMessage(this.state.message).then((result)=>{
                                this.setState({messageList:[...this.state.messageList, result], message:''})
                                this.textInput.clear()
                                console.log(this.state.messageList)
                            }).catch((err)=>{
                                err?console.log('not Send'):null
                            })
                        }}
                    >
                        <Text
                            style={{
                                textAlign   :   'center'
                            }}
                        >
                            SEND
                        </Text>
                    </TouchableOpacity>
               </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
        container : {
            flex                : 1,
            paddingVertical     :   height*0.025,
            paddingHorizontal   :   width*0.025,
            backgroundColor     :   '#ddd'
        }
})
export default Login
