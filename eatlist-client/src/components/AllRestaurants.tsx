import { FunctionComponent, useEffect, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import "../style/home.css"
import "../style/card-pages.css"
import Restaurant from "../interfaces/Restaurant";
import { getAllRestaurants } from "../services/RestaurantService";
import Loader from "./Loader";
import Footer from "./Footer";
import Swal from "sweetalert2";
import HoverBadge from "./HoverBadge";

interface AllRestaurantsProps {
    
}
 
const AllRestaurants: FunctionComponent<AllRestaurantsProps> = () => {
    const [isLoading, setIsLoading] = useState<Boolean>(true);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    const [search, setSearch] = useState<string>("");
    const [appliedFilters, setAppliedFilters] = useState<string[]>([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);

    const [view, setView] = useState<"cards" | "table">("cards");

    useEffect(() => {            
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
                        text: "משהו השתבש בהצגת המידע. נסו שוב",
                        icon: "error",
                        confirmButtonText: "חזרה"
                    })
                });
        }, []);
    
    const getLang = (text: string) => {
        // Regex for Hebrew Unicode range
        const hebrewPattern = /[\u0590-\u05FF]/;
        return hebrewPattern.test(text) ? "he" : "en";
    };
    const location = useLocation();

    useEffect(() => {
        const genresFromUrl = searchParams.getAll("genre");
        setAppliedFilters(genresFromUrl);
    }, [searchParams]);

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
        if (appliedFilters.length === 0) {
            setFilteredRestaurants(restaurants);
        } else {
            setSearch("");
            setFilteredRestaurants(restaurants.filter((r) => appliedFilters.includes(r.genre)));
        }
    }, [appliedFilters, restaurants]);

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

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 720) {
                setView("cards");
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (<>
    <Navbar/>
    <Sidebar/>
    {isLoading ? (<>
        <div className="container-home">
            <Loader />
        </div>
    </>) : (<>
        <main className="container-home justify-spacebt" lang="he">
            <div style={{width:"100%"}}>
                <div className="category-page-banner">
                    <img src="https://cdn.dribbble.com/userupload/31776407/file/original-9912ad5f5772dc1e836e97350967fa3f.jpg" alt="eatlist" className="banner-overlay"/>
                    <p className="banner-header">מה מחפשים היום?</p>
                    <div className="search-bar">
                        <div className="search-container">
                            <input type="text" placeholder="חיפוש מסעדה" className="search-input" value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <i className="fa-solid fa-magnifying-glass search-icon"></i>
                    </div>
                </div>
                <div className="homepage-section">
                    <div className="btn-container">
                        <div className="view-toggle" style={{marginRight:"64px"}}>
                            <HoverBadge badgeContent={
                                <button className={`icon-btn ${view === "cards" ? "active" : ""}`} onClick={() => setView("cards")}>
                                    <i className="fa-solid fa-table-cells-large"></i>
                                </button>
                            } hoverText="תצוגת כרטיסים" />
                            <HoverBadge badgeContent={
                                <button className={`icon-btn ${view === "table" ? "active" : ""}`} onClick={() => setView("table")}>
                                    <i className="fa-solid fa-table-list"></i>
                                </button>
                            } hoverText="תצוגת טבלה" />
                        </div>
                        <div className="filter-btn-container" style={{marginLeft:"64px"}}>
                            {appliedFilters.length > 0 && (
                                <p className="secondary-text">({appliedFilters.length})</p>
                            )}
                            <Link to={`/restaurants/filters`} state={{ background: location }} className="filter-btn-link">
                                <button className="icon-btn" style={{color: (appliedFilters.length > 0) ? "var(--primary-purple)" : "var(--dark-grey)"}}>
                                    <i className="fa-solid fa-filter"></i>
                                </button>
                            </Link>
                        </div>
                    </div>
                    <div className="restaurants-section">
                        {view === "cards" ? (
                        <div className="restaurant-cards">
                            {filteredRestaurants.map((restaurant) => (
                                <Link to={`/restaurants/${restaurant._id}`} state={{ background: location }} className="single-card" key={restaurant._id}>
                                    <div className="single-card" lang="he">
                                        <img src={restaurant.imageUrl} alt={restaurant.name.main} className="card-image"/>
                                        <p className="card-tag">{restaurant.genre}</p>
                                        <div className="card-info">
                                            <h3 className="card-header" lang={getLang(restaurant.name.main)} style={{direction:"rtl", fontWeight:600}}>
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
                        ) : (
                            <table className="eatlist-restaurants-table" lang="he">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>שם</th>
                                        <th>סוג</th>
                                        <th>כתובת</th>
                                        <th>טלפון</th>
                                        <th>סימוני ״אהבתי״</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRestaurants.map((restaurant, index) => (
                                        <tr key={restaurant._id} onClick={() => navigate(`/restaurants/${restaurant._id}`, { state: { background: location } })} style={{cursor: "pointer"}}>
                                            <td>
                                                <img src={restaurant.imageUrl} alt={restaurant.name.main} className="eatlist-restaurant-image"/>
                                            </td>
                                            <td className="name-and-note-cell">
                                                <div lang={getLang(restaurant.name.main)} className="eatlist-restaurant-name">
                                                    {restaurant.name.main}
                                                </div>
                                            </td>
                                            <td className="table-text">{restaurant.genre}</td>
                                            <td className="table-text">{restaurant.address.street} {restaurant.address.houseNumber}, {restaurant.address.city}</td>
                                            <td className="table-text">{restaurant.phone || "—"}</td>
                                            <td className="table-text">
                                                <i className="fa-solid fa-heart" style={{color: "#DB3A34", marginLeft: "4px"}}></i>
                                                {restaurant.likes.length}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    </>)}
    </>);
}
 
export default AllRestaurants;