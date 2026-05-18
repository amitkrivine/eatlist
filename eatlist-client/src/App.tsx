import './App.css';
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Register from './components/Register';
import Login from './components/Login';
import Home from './components/Home';
import Profile from './components/Profile';
import About from './components/About';
import Modal from './components/Modal';
import RestaurantInfo from './components/RestaurantInfo';
import LikedRestaurants from './components/LikedRestaurants';
import AllEatlists from './components/AllEatlists';
import AllRestaurants from './components/AllRestaurants';
import FilterModal from './components/FilterModal';
import RestaurantPicker from './components/RestaurantPicker';
import ViewEatlist from './components/ViewEatlist';
import EditEatlist from './components/EditEatlist';
import EditNote from './components/EditNote';
import SearchResults from './components/SearchResults';
import RestaurantManagement from './components/RestaurantManagement';
import EditRestaurant from './components/EditRestaurant';
import AddRestaurant from './components/AddRestaurant';
import UserManagement from './components/UserManagement';
import EditUser from './components/EditUser';


function AppContent() {
  const location = useLocation();

  // a check if we are trying to open a modal "over" the current page
  const background = location.state?.background;

  return (
    <>
      {/* Main Routes: These change the background page */}
      <Routes location={background || location}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<About />} />
        <Route path="/eatlist/:id" element={<ViewEatlist />} />
        <Route path="/eatlists" element={<AllEatlists />} />
        <Route path="/restaurants" element={<AllRestaurants />} />
        <Route path="/liked-restaurants" element={<LikedRestaurants />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/restaurant-management" element={<RestaurantManagement/>} />
        <Route path="/user-management" element={<UserManagement/>} />
        
        {/* Fallback for direct links to the modal (no background state) */}
        {!background && (<>
          <Route path="/restaurants/:id" element={<RestaurantInfo />} />
          <Route path="/restaurants/filters" element={<FilterModal />} />
          <Route path="/add-restaurant" element={<AddRestaurant />} />
          <Route path="/edit-restaurant/:id" element={<EditRestaurant />} />
          <Route path="/eatlist/:id/add-restaurants" element={<RestaurantPicker />} />
          <Route path="/eatlist/:id/edit" element={<EditEatlist />} />
          <Route path="//eatlist/:id/edit-note/:restaurantId" element={<EditNote />} />
          <Route path="/edit-user/:id" element={<EditUser />} />
        </>
        )}
      </Routes>

      {/* Modal Routes: Only rendered if a 'background' state exists */}
      {background && (
        <Routes>
          <Route path="/restaurants/:id" element={
              <Modal>
                <RestaurantInfo />
              </Modal>
            }/>
          <Route path="/restaurants/filters" element={
              <Modal>
                <FilterModal />
              </Modal>
            }/>
          <Route path="/add-restaurant" element={
              <Modal>
                <AddRestaurant />
              </Modal>
            }/>
            <Route path="/edit-restaurant/:id" element={
              <Modal>
                <EditRestaurant />
              </Modal>
            }/>
          <Route path="/eatlist/:id/add-restaurants" element={
              <Modal>
                <RestaurantPicker />
              </Modal>
            }/>
          <Route path="/eatlist/:id/edit" element={
              <Modal>
                <EditEatlist />
              </Modal>
            }/>
          <Route path="/eatlist/:id/edit-note/:restaurantId" element={
              <Modal>
                <EditNote />
              </Modal>
            }/>
            <Route path="/edit-user/:id" element={
              <Modal>
                <EditUser />
              </Modal>
            }/>
        </Routes>
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;