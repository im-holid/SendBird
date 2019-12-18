

import {createAppContainer} from 'react-navigation'
import {createStackNavigator} from 'react-navigation-stack'


import Login from './src/components/Login'
import Chat from './src/components/Chat';


const App = createAppContainer(createStackNavigator({
  Home: {
    screen: Login,
    navigationOptions:{
      header : null
    }
  },
  Chat: {
    screen: Chat,
    navigationOptions:{
      header : null
    }
  }
}));


export default App
