import { FunctionComponent, useEffect, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import "../style/home.css"
import "../style/card-pages.css"
import Restaurant from "../interfaces/Restaurant";
import Token from "../interfaces/Token";
import { decodeToken, getUserById } from "../services/UserService";
import { getAllRestaurants } from "../services/RestaurantService";
import Loader from "./Loader";
import Swal from "sweetalert2";

interface RestaurantManagementProps {
    
}
 
const RestaurantManagement: FunctionComponent<RestaurantManagementProps> = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const navigate = useNavigate();
    
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    const [search, setSearch] = useState<string>("");
    const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);

    useEffect(() => {
            const token: Token | null = decodeToken();
            !token ? setIsLoggedIn(false) : setIsLoggedIn(true);
            setIsAdmin(token?.isAdmin || false)

            getAllRestaurants()
                .then((response) => {
                    setRestaurants(response.data);
                    setIsLoading(false);
                })
                .catch((error) => {
                    console.log(error);
                    setIsLoading(false);
                    Swal.fire({
                        title: "...אופס",
                        text: "משהו השתבש. נסו שוב",
                        icon: "error",
                        confirmButtonText: "חזרה"
                    });
                });
        }, []);
    
    const getLang = (text: string) => {
        // Regex for Hebrew Unicode range
        const hebrewPattern = /[\u0590-\u05FF]/;
        return hebrewPattern.test(text) ? "he" : "en";
    };
    const location = useLocation();

    useEffect(() => {
        if (search.trim() === "") {
            setFilteredRestaurants(restaurants);
        } else {
            navigate(location.pathname, { replace: true });
            setFilteredRestaurants(restaurants.filter((r) =>
                r.name.main.toLowerCase().includes(search.toLowerCase()) ||
                r.name.alt?.toLowerCase().includes(search.toLowerCase()) ||
                r.description?.toLowerCase().includes(search.toLowerCase()) ||
                r.genre.toLowerCase().includes(search.toLowerCase()) ||
                r.address.city.toLowerCase().includes(search.toLowerCase()) ||
                r.address.street.toLowerCase().includes(search.toLowerCase())
            ));
        }
    }, [search, restaurants]);

    useEffect(() => {
        const handleRestaurantChanged = () => {
            getAllRestaurants()
                .then((response) => {
                    setRestaurants(response.data);
                })
                .catch((error) => console.log(error));
        };
    
        window.addEventListener("restaurantChanged", handleRestaurantChanged);
        return () => window.removeEventListener("restaurantChanged", handleRestaurantChanged);
    }, []);

    return (<>
    <Navbar/>
    <Sidebar/>
    {isLoading ? (<>
        <div className="container-home">
            <Loader />
        </div>
    </>) : (<>
        {isAdmin ? (
            <main className="container-home" lang="he">
                <div className="category-page-banner admin-banner">
                    <img src="https://cdn.dribbble.com/userupload/31776407/file/original-9912ad5f5772dc1e836e97350967fa3f.jpg" alt="eatlist" className="banner-overlay"/>
                    <p className="banner-header" style={{color: "var(--black)", fontWeight:700}}>מסך ניהול מסעדות</p>
                    
                    <p className="banner-header" style={{color: "var(--vibrant-green)", fontSize:"28px"}}>איזו מסעדה תרצו לערוך?</p>
                    <div className="search-bar">
                        <div className="search-container">
                            <input type="text" placeholder="חיפוש מסעדה" className="search-input" value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <i className="fa-solid fa-magnifying-glass search-icon"></i>
                    </div>
                </div>
                <div className="homepage-section">
                    <div className="button-container">
                    <Link to={`/add-restaurant`} state={{ background: location }} className="filter-btn-link">
                        <button className="btn-primary z-index-front" style={{backgroundColor: "var(--vibrant-green)", margin: "8px 0 24px 0"}}>הוספת מסעדה חדשה</button>
                    </Link>
                    </div>
                    <div className="restaurants-section">
                        <div className="restaurant-cards">
                            {filteredRestaurants.map((restaurant) => (
                                <Link to={`/edit-restaurant/${restaurant._id}`} state={{ background: location }} className="single-card">
                                    <div className="single-card" lang="he" key={restaurant._id}>
                                        <img src={restaurant.imageUrl} alt={restaurant.name.main} className="card-image"/>
                                        <p className="card-tag">{restaurant.genre}</p>
                                        <div className="card-info">
                                            <h3 className="card-header" lang={getLang(restaurant.name.main)} style={{direction:"rtl", fontWeight:600, color:"var(--vibrant-green)"}}>
                                                {restaurant.name.main}
                                            </h3>
                                            <p className="card-text">
                                                {restaurant.address.street} {restaurant.address.houseNumber}, {restaurant.address.city}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        ) : (
            <div className="container" lang="he">
                <img src="https://cdn.dribbble.com/userupload/31776407/file/original-9912ad5f5772dc1e836e97350967fa3f.jpg" alt="eatlist" className="banner-overlay"/>
                <div className="container-content z-index-front">
                    <div>
                        <p className="">יש להתחבר לחשבון כדי לצפות בעמוד זה</p>
                    </div>
                </div>
            </div>
        )}
    </>)}
    </>);
}
 
export default RestaurantManagement;