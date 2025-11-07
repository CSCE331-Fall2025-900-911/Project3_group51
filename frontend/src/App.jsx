import React from 'react';
import { Routes, Route} from 'react-router-dom';
import HomeScreen from './components/HomeScreen'; //HomeScreen
import OrderScreen from './components/OrderScreen'; //OrderScreen

function App() {
  return (
    <>
      {/* Routes controller swap Screens */}
      <Routes>
        {/* Route 1: The default path "/" shows the HomeScreen */}
        <Route path="/" element= {<HomeScreen/>}/>
        {/* Route 2: The default path "/" shows the HomeScreen */}
        <Route path="/order" element= {<OrderScreen/>}/>
        {/* We can add the "/management" route here later for the employee login */}
        {/* <Route path="/management" element={<ManagementScreen />} /> */}
  
        {/* Add more routes*/}
      </Routes>
    </>
  );
}

export default App;