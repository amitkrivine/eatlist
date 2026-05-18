import { FunctionComponent, useEffect, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import User from "../interfaces/User";
import { decodeToken, getUserById } from "../services/UserService";
import Swal from "sweetalert2";
import { getAllRestaurants, likeRestaurant } from "../services/RestaurantService";
import Restaurant from "../interfaces/Restaurant";
import { Link, useLocation } from "react-router-dom";
import Loader from "./Loader";

interface LikedRestaurantsProps {
    
}
 
const LikedRestaurants: FunctionComponent<LikedRestaurantsProps> = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [user, setUser] = useState<User>();
    const [likedRestaurants, setLikedRestaurants] = useState<any[]>([]);
    const [likedRestaurantIds, setLikedRestaurantIds] = useState<Set<string>>(new Set());
    const userToken = decodeToken();

    useEffect(() => {
        if (userToken?._id) {
            getUserById(userToken?._id as string)
            .then((response) => setUser(response.data))
            .catch((error) => {
                console.log(error);
                Swal.fire({
                    title: "...אופס",
                    text: "משהו השתבש. נסו שוב",
                    icon: "error",
                    confirmButtonText: "חזרה"
                });
            });

            getAllRestaurants()
                .then((response) => {
                    // find restaurant liked by the user
                    const liked = response.data
                        .filter((restaurant: Restaurant) => 
                            restaurant.likes.some((like) => like.userId === userToken._id))
                        .sort((a: Restaurant, b: Restaurant) =>
                            new Date(
                                a.likes.find((l) => l.userId === userToken._id)!.createdAt
                            ).getTime() -
                            new Date(
                                b.likes.find((l) => l.userId === userToken._id)!.createdAt
                            ).getTime());
                    setLikedRestaurants(liked);
                    setIsLoading(false); 

                    const likedIds = new Set<string>(liked.map((r: Restaurant) => r._id as string));
                    setLikedRestaurantIds(likedIds)
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
        };
    }, []);

    // detect if eatlist name is in Hebrew or English for font assignment
    const getLang = (text: string) => {
        // Regex for Hebrew Unicode range
        const hebrewPattern = /[\u0590-\u05FF]/;
        return hebrewPattern.test(text) ? "he" : "en";
    };
    const location = useLocation();

    return (<>
    <Navbar/>
    <Sidebar/>
    {isLoading ? (<>
        <div className="container-home">
            <Loader />
        </div>
    </>) : (<>
        <div className="eatlist-container" lang="he">
            <div className="eatlist-header">
                <div className="eatlist-image">
                    <div className="liked-restaurants-img" style={{fontSize: "2.5rem"}}>
                        <i className="fa-solid fa-heart"></i>
                    </div>
                </div>
                <div className="header-content">
                    <h2 className="eatlist-name">מסעדות שאהבתי</h2>
                    <p className="eatlist-description">כל המסעדות שסומנו כאהובות במקום אחד</p>
                    <div className="eatlist-stats">
                        <div className="eatlist-user">
                            <img src={user?.imageUrl || ""} alt={`${user?.name.first} ${user?.name.last}` || "eatlist user"} className="user-image" />
                            <p className="username">{user?.name.first} {user?.name.last}</p>
                        </div>
                    </div>
                </div>
            </div>

            <table className="eatlist-restaurants-table">
                <thead>
                    <tr>
                        <th className="desktop-only">#</th>
                        <th className="hidden-on-small-mobile"></th>
                        <th>שם</th>
                        <th>סוג</th>
                        <th className="desktop-only">כתובת</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {likedRestaurants.map((restaurant, index) => (
                        <tr key={restaurant._id}>
                            <td className="desktop-only">{index + 1}</td>
                            <td className="hidden-on-small-mobile">
                                <img src={restaurant.imageUrl} alt={restaurant.name.main || "eatlist"} className="eatlist-restaurant-image" />
                            </td>
                            <td className="name-and-note-cell">
                                <div lang={getLang(restaurant.name.main as string)} className="eatlist-restaurant-name" style={!restaurant.userNote ? ({marginTop:"8px"}) : ({margin:0})}>
                                    {restaurant.name.main}
                                </div>
                                {restaurant.userNote && (
                                    <div className="eatlist-restaurant-comment">
                                        <span><i className="fa-solid fa-comment-dots"></i></span> {restaurant.userNote}
                                    </div>
                                )}
                            </td>
                            <td className="table-text padding12">{restaurant.genre}</td>
                            <td className="table-text desktop-only">{restaurant.address.street} {restaurant.address.houseNumber}, {restaurant.address.city}</td>
                            <td className="padding12">
                                <i className="fa-solid fa-heart"
                                    style={{ color: likedRestaurantIds.has(restaurant._id as string) ? "#DB3A34" : "#999", cursor: "pointer" }}
                                    onClick={() => {
                                        likeRestaurant(restaurant._id as string)
                                            .then(() => {
                                                setLikedRestaurantIds((prev) => {
                                                    const updated = new Set(prev);
                                                    if (updated.has(restaurant._id as string)) {
                                                        updated.delete(restaurant._id as string);
                                                        setLikedRestaurants((prev) => prev.filter((r) => r._id !== restaurant._id)); // 👈 remove from list
                                                    } else {
                                                        updated.add(restaurant._id as string);
                                                    }
                                                    return updated;
                                                });
                                                window.dispatchEvent(new CustomEvent("restaurantLikeChanged"));
                                            })
                                            .catch((error) => {
                                                console.log(error);
                                                Swal.fire({
                                                    title: "...אופס",
                                                    text: "משהו השתבש. נסו שוב",
                                                    icon: "error",
                                                    confirmButtonText: "חזרה"
                                                });
                                            });
                                    }}
                                ></i>
                            </td>
                            <td>
                                <Link to={`/restaurants/${restaurant._id}`} state={{ background: location }}>
                                    <button className="btn-secondary">צפייה בפרטים</button>
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </>)}
    </>);
}
 
export default LikedRestaurants;