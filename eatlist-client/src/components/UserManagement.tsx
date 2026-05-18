import { FunctionComponent, useEffect, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../style/home.css"
import "../style/card-pages.css"
import "../style/management-pages.css"
import "../style/global-assets.css"
import Token from "../interfaces/Token";
import { decodeToken, deleteUser, getAllUsers } from "../services/UserService";
import Loader from "./Loader";
import User from "../interfaces/User";
import { getAllEatlists } from "../services/EatlistService";
import Eatlist from "../interfaces/Eatlist";
import { getAllRestaurants } from "../services/RestaurantService";
import Restaurant from "../interfaces/Restaurant";
import Swal from "sweetalert2";

interface UserManagementProps {
    
}
 
const UserManagement: FunctionComponent<UserManagementProps> = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const navigate = useNavigate();
    
    const [users, setUsers] = useState<User[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    const [search, setSearch] = useState<string>("");
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

    const [eatlistCounts, setEatlistCounts] = useState<Record<string, number>>({});
    const [likedCounts, setLikedCounts] = useState<Record<string, number>>({});

    useEffect(() => {
            const token: Token | null = decodeToken();
            !token ? setIsLoggedIn(false) : setIsLoggedIn(true);
            setIsAdmin(token?.isAdmin || false)

            getAllUsers()
                .then((response) => {
                    setUsers(response.data);
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
            setFilteredUsers(users);
        } else {
            navigate(location.pathname, { replace: true });
            setFilteredUsers(users.filter((u) =>
                u.name.first.toLowerCase().includes(search.toLowerCase()) ||
                u.name.last.toLowerCase().includes(search.toLowerCase()) ||
                u.email.toLowerCase().includes(search.toLowerCase()) ||
                u.phone.toLowerCase().includes(search.toLowerCase()) ||
                u.address.city.toLowerCase().includes(search.toLowerCase()) ||
                u.address.street.toLowerCase().includes(search.toLowerCase())
            ));
        }
    }, [search, users]);

    useEffect(() => {
        getAllEatlists()
            .then((response) => {
                const counts = response.data.reduce((acc: Record<string, number>, eatlist: Eatlist) => {
                    acc[eatlist.userId] = (acc[eatlist.userId] || 0) + 1;
                    return acc;
                }, {});
                setEatlistCounts(counts);
            })
            .catch((error) => {
                console.log(error);
                Swal.fire({
                    title: "...אופס",
                    text: "משהו השתבש. נסו שוב",
                    icon: "error",
                    confirmButtonText: "חזרה"
                });
            })
    }, []);

    useEffect(() => {
        getAllRestaurants()
            .then((response) => {
                const counts = response.data.reduce((acc: Record<string, number>, restaurant: Restaurant) => {
                    restaurant.likes.forEach((like) => {
                        acc[like.userId] = (acc[like.userId] || 0) + 1;
                    });
                    return acc;
                }, {});
                setLikedCounts(counts);
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
        const handleUserChanged = () => {
            getAllUsers()
                .then((response) => {
                    setUsers(response.data);
                })
                .catch((error) => console.log(error));
        };
        window.addEventListener("userChanged", handleUserChanged);
        return () => window.removeEventListener("userChanged", handleUserChanged);
    }, []);

    const handleDeleteUser = (userId : string) => {
            Swal.fire({
                title: "מחיקת משתמש",
                text: "בטוח? פעולה זו אינה ניתנת לביטול",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "מחיקה",
                cancelButtonText: "ביטול",
                confirmButtonColor: "#d33",
            }).then((response) => {
                if (response.isConfirmed) {
                    deleteUser(userId as string)
                        .then(() => {
                            window.dispatchEvent(new CustomEvent("userChanged"));
                            Swal.fire({
                                title: "מחיקה בוצעה",
                                text: "המשתמש נמחק בהצלחה",
                                icon: "success",
                                timer: 2000,
                                showConfirmButton: false,
                            })
                                .then(() => navigate("/user-management"))
                                .catch((error) => {
                                    console.log(error);
                                    Swal.fire({
                                        title: "...אופס",
                                        text: "משהו השתבש. נסו שוב",
                                        icon: "error",
                                        confirmButtonText: "חזרה"
                                    });
                                });
                        })
                        .catch((error) => {
                            console.log(error)
                            Swal.fire({
                                icon: "error",
                                title: "...אופס",
                                text: "אירעה שגיאה. נסו שוב",
                                confirmButtonText: "חזרה"
                            })
                        })
                }
            });
        };

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
                    <p className="user-banner-header">מסך ניהול משתמשים</p>
                    
                    <p className="user-banner-subheader">איזה משתמש תרצו לערוך?</p>
                    <div className="search-bar">
                        <div className="search-container">
                            <input type="text" placeholder="חיפוש משתמש" className="search-input" value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <i className="fa-solid fa-magnifying-glass search-icon"></i>
                    </div>
                </div>
                <div className="user-page-section">
                    <div className="user-cards-section centered">
                        <div className="user-cards">
                            {filteredUsers.map((user) => (
                                <div className="single-user-card" lang="he" key={user._id}>
                                        <img src={user.imageUrl} alt="eatlist-user-img" className="user-card-image"/>
                                        <div className="user-card-info">
                                            <h3 className="card-header" lang={getLang(user.name.first)} style={{direction:"rtl", fontWeight:600, fontSize:"20px"}}>
                                                {user.name.first} {user.name.last}
                                            </h3>
                                            {user.isAdmin && (
                                                <p className="card-text" style={{fontWeight:700}}>
                                                    משתמש מנהל
                                                </p>
                                            )}
                                            <hr className="divider-thin"/>
                                            {user.address.street ? (
                                                <p className="card-text">
                                                    {user.address.street} {user.address.houseNumber}, {user.address.city}
                                                </p>
                                            ) : (
                                                <p className="card-text">ללא כתובת</p>
                                            )}
                                            <p className="card-text">
                                                {user.phone}
                                            </p>
                                            <p className="card-text">
                                                {user.email}
                                            </p>
                                            <hr className="divider-thin"/>
                                            {(eatlistCounts || likedCounts) && (<>
                                                <p className="card-text">
                                                    <span style={{fontWeight:600, color:"var(--bubblegum)"}}><span lang="en" style={{fontWeight:600}}>Eatlists</span> ע״י היוזר:</span> {eatlistCounts[user._id as string] || 0}
                                                </p>
                                                <p className="card-text">
                                                    <span style={{fontWeight:600, color:"var(--bubblegum)"}}>מסעדות אהובות:</span> {likedCounts[user._id as string] || 0}
                                                </p>
                                            </>)}
                                            <div className="icon-container">
                                                <Link to={`/edit-user/${user._id}`} state={{ background: location }} className="link-display">
                                                    <button className="small-icon-btn">
                                                        <i className="fa-solid fa-pencil"></i>
                                                    </button>
                                                </Link>
                                                <button className="small-icon-btn" onClick={() => {
                                                    handleDeleteUser(user._id as string);
                                                }}>
                                                    <i className="fa-solid fa-trash-can"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
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
                        <p className="">יש להתחבר לחשבון ניהול כדי לצפות בעמוד זה</p>
                    </div>
                </div>
            </div>
        )}
    </>)}
    </>);
}
 
export default UserManagement;