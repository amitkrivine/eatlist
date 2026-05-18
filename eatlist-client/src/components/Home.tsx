import { FunctionComponent, useEffect, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import "../style/home.css"
import Eatlist from "../interfaces/Eatlist";
import Restaurant from "../interfaces/Restaurant";
import { decodeToken } from "../services/UserService";
import Token from "../interfaces/Token";
import { getAllEatlists } from "../services/EatlistService";
import { getAllRestaurants } from "../services/RestaurantService";
import CarouselSection from "./Carousel";
import RestaurantCard from "./RestaurantCard";
import EatlistCard from "./EatlistCard";
import Footer from "./Footer";
import Swal from "sweetalert2";

interface HomeProps {
    
}
 
const Home: FunctionComponent<HomeProps> = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [mostLikedRestaurants, setMostLikedRestaurants] = useState<Restaurant[]>([]);
    const [newRestaurants, setNewRestaurants] = useState<Restaurant[]>([]);
    const [followedEatlists, setFollowedEatlists] = useState<Restaurant[]>([]);
    const [mostFollowedEatlists, setMostFollowedEatlists] = useState<Restaurant[]>([]);
    const [eatlists, setEatlists] = useState<Eatlist[]>([]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);    
    };

    useEffect(() => {
        const token: Token | null = decodeToken();
        !token ? setIsLoggedIn(false) : setIsLoggedIn(true);
        
        // find user's eatlists and most followed eatlists
        getAllEatlists()
            .then((response) => {
                const publicEatlists = response.data.filter((eatlist: Eatlist) => eatlist.isPublic);
                setEatlists(publicEatlists);
                
                if (token?._id) {
                    const followed = publicEatlists.filter((eatlist: Eatlist) =>
                        eatlist.followers.some((follower) => follower.userId === token._id)
                    );
                    setFollowedEatlists(followed);
                }
                const mostFollowed = publicEatlists
                    .sort((a: Eatlist, b: Eatlist) => 
                        b.followers.length - a.followers.length
                    )
                    .slice(0, 8);

                setMostFollowedEatlists(mostFollowed);
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
    
        // find new and most liked restaurants
        getAllRestaurants()
            .then((response) => {
                setRestaurants(response.data);
            
                const mostLiked = response.data
                    .sort((a: Restaurant, b: Restaurant) => 
                        b.likes.length - a.likes.length
                    )
                    .slice(0, 8);

                setMostLikedRestaurants(mostLiked);

                const recentlyJoined = response.data
                    .sort((a: Restaurant, b: Restaurant) => 
                        new Date(b.createdAt as Date).getTime() - new Date(a.createdAt as Date).getTime()
                    )
                    .slice(0, 8);

            setNewRestaurants(recentlyJoined);
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
    }, []);

    useEffect(() => {
        const handleRestaurantChanged = () => {
            getAllRestaurants()
                .then((response) => {
                    setRestaurants(response.data);
    
                    const mostLiked = [...response.data]
                        .sort((a: Restaurant, b: Restaurant) => b.likes.length - a.likes.length)
                        .slice(0, 8);
                    setMostLikedRestaurants(mostLiked);
    
                    const recentlyJoined = [...response.data]
                        .sort((a: Restaurant, b: Restaurant) =>
                            new Date(b.createdAt as Date).getTime() - new Date(a.createdAt as Date).getTime()
                        )
                        .slice(0, 8);
                    setNewRestaurants(recentlyJoined);
                })
                .catch((error) => console.log(error));
        };
    
        window.addEventListener("restaurantChanged", handleRestaurantChanged);
        return () => window.removeEventListener("restaurantChanged", handleRestaurantChanged);
    }, []);
    
    return (<>
    <Sidebar/>
    <Navbar/>
    <main className="container-home" lang="he">
        <div className="homepage-banner">
            <img src="https://cdn.dribbble.com/userupload/31776407/file/original-9912ad5f5772dc1e836e97350967fa3f.jpg" alt="eatlist" className="banner-overlay"/>
            <img src="logo_lg_mix_dark1.png" alt="eatlist logo" className="eatlist-logo"/>
            <p className="banner-text">לא שואלים יותר לאן הולכים לאכול.<br />פותחים <span lang="en">Eatlist</span>!</p>
        </div>
        <div className="homepage-section">
                {/* 1. New Restaurants */}
                <CarouselSection 
                    title={<>חדשים ב-<span lang="en" style={{fontWeight:600}}>Eatlist</span></>}
                    seeAll="restaurants"
                    seeAllTitle="לכל המסעדות"
                    data={newRestaurants}
                    renderItem={(res: Restaurant) => <RestaurantCard key={res._id} restaurant={res} />}
                />

                {/* 2. Favorite Restaurants */}
                <CarouselSection 
                    title="המסעדות האהובות ביותר"
                    seeAll="restaurants"
                    seeAllTitle="לכל המסעדות"
                    data={mostLikedRestaurants} 
                    renderItem={(res: Restaurant) => <RestaurantCard key={res._id} restaurant={res} />}
                />

                {/* 3. Followed Eatlists */}
                {isLoggedIn && (
                    <CarouselSection 
                        title={<>ה-<span lang="en" style={{fontWeight:600}}>Eatlists</span> עם הכי הרבה עוקבים</>}
                        seeAll="eatlists"
                        seeAllTitle="לכל ה-Eatlists"
                        data={mostFollowedEatlists}
                        renderItem={(eatlist: Eatlist) => <EatlistCard key={eatlist._id} eatlist={eatlist} />}
                    />
                )}
            </div>
            <Footer/>
        </main>
    </>);
}

 
export default Home;