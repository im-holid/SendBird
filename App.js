

import {createAppContainer} from 'react-navigation'
import {createStackNavigator} from 'react-navigation-stack'


import Login from './src/components/Login'


const App = createAppContainer(createStackNavigator({
  Home: {
    screen: Login,
    navigationOptions:{
      header : null
    }
  },
}));


export default App
