import { FunctionComponent, useEffect, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Eatlist from "../interfaces/Eatlist";
import { getAllEatlists } from "../services/EatlistService";
import Token from "../interfaces/Token";
import { decodeToken, getUserById } from "../services/UserService";
import "../style/home.css"
import { Link } from "react-router-dom";
import Loader from "./Loader";
import Footer from "./Footer";
import Swal from "sweetalert2";

interface AllEatlistsProps {
    
}
 
const AllEatlists: FunctionComponent<AllEatlistsProps> = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [eatlists, setEatlists] = useState<Eatlist[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    const [search, setSearch] = useState<string>("");
    const [filteredEatlists, setFilteredEatlists] = useState<Eatlist[]>([]);

    const [creators, setCreators] = useState<Record<string, string>>({});

    useEffect(() => {
        const token: Token | null = decodeToken();
        !token ? setIsLoggedIn(false) : setIsLoggedIn(true);
        
        getAllEatlists()
            .then((response) => {
                const publicEatlists = response.data.filter((eatlist: Eatlist) => eatlist.isPublic);
                setEatlists(publicEatlists);
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

    useEffect(() => {
        if (eatlists.length === 0) return;
        
        const creatorPromises = eatlists.map((eatlist) =>
            getUserById(eatlist.userId).then((res) => ({
                eatlistId: eatlist._id as string,
                name: `${res.data.name.first} ${res.data.name.last}`
            }))
        );
    
        Promise.all(creatorPromises)
            .then((results) => {
                const creatorsMap = results.reduce((acc, curr) => ({
                    ...acc,
                    [curr.eatlistId]: curr.name
                }), {} as Record<string, string>);
                setCreators(creatorsMap);
            })
            .catch((error) => console.log(error));
    }, [eatlists]);

    useEffect(() => {
        if (search.trim() === "") {
            setFilteredEatlists(eatlists);
        } else {
            setFilteredEatlists(eatlists.filter((e) =>
                e.name.toLowerCase().includes(search.toLowerCase()) ||
                e.description?.toLowerCase().includes(search.toLowerCase())
            ));
        }
    }, [search, eatlists]);

    const getLang = (text: string) => {
        // Regex for Hebrew Unicode range
        const hebrewPattern = /[\u0590-\u05FF]/;
        return hebrewPattern.test(text) ? "he" : "en";
    };
    
    return (<>
    <Navbar/>
    <Sidebar/>
    {isLoading ? (<>
        <div className="container-home">
            <Loader />
        </div>
    </>) : (<>
        {isLoggedIn ? (
            <main className="container-home justify-spacebt" lang="he">
                <div className="category-page-banner">
                    <img src="https://cdn.dribbble.com/userupload/31776407/file/original-9912ad5f5772dc1e836e97350967fa3f.jpg" alt="eatlist" className="banner-overlay"/>
                    <p className="banner-header">איזה <span lang="en" style={{fontWeight: 500}}>Eatlist</span> מחפשים היום?</p>
                    <div className="search-bar">
                        <div className="search-container">
                        <input type="text" placeholder="חיפוש Eatlist" className="search-input" value={search} onChange={(e) => setSearch(e.target.value)}/>
                        </div>
                        <i className="fa-solid fa-magnifying-glass search-icon"></i>
                    </div>
                </div>
                <div className="homepage-section">
                    <div className="restaurant-section">
                        {filteredEatlists.length === 0 ? (
                            <p className="note-text">לא נמצאו Eatlists התואמים לחיפוש</p>
                        ) : (
                            <div className="restaurant-cards">
                                {filteredEatlists.map((eatlist) => (
                                    <Link to={`/eatlist/${eatlist._id}`} className="single-card" key={eatlist._id}>
                                        <div lang="he">
                                            <img src={eatlist.imageUrl || "/fork_img.png"} alt={`${eatlist.name} eatlist`} className="card-image"/>
                                            <p className="card-tag">{eatlist.followers.length} עוקבים</p>
                                            <div className="card-info">
                                                <h3 className="card-header" lang={getLang(eatlist.name)} style={{direction:"rtl", fontWeight:600}}>
                                                    {eatlist.name}
                                                </h3>
                                                <p className="card-text">
                                                    {creators[eatlist._id as string] || ""}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <Footer />
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
 
export default AllEatlists;