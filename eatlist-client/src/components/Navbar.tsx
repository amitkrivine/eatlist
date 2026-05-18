import { FunctionComponent, useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "../hooks/useSidebar";
import Token from "../interfaces/Token";
import { decodeToken } from "../services/UserService";
import "../style/navbar.css";

interface NavbarProps {}

const Navbar: FunctionComponent<NavbarProps> = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");

    const { toggle } = useSidebar();

    useEffect(() => {
        const token: Token | null = decodeToken();
        !token ? setIsLoggedIn(false) : setIsLoggedIn(true);
        setIsAdmin(token?.isAdmin || false);
    }, []);

    useEffect(() => {
        if (location.pathname.startsWith("/search")) {
            const params = new URLSearchParams(location.search);
            setSearchQuery(params.get("q") || "");
        } else {
            setSearchQuery("");
        }
    }, [location]);

    const searchInputRef = useRef<HTMLInputElement>(null);

    // focus the input when landing on the search page
    useEffect(() => {
        if (location.pathname.startsWith("/search")) {
            searchInputRef.current?.focus();
        }
    }, [location.pathname]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (value.trim() === "") {
            navigate("/");
        } else {
            navigate(`/search?q=${encodeURIComponent(value)}`, { replace: true });
        }
    };

    return (
        <nav className="top-navbar" lang="he">
            <div className="navbar-right">
                <button className="icon-btn nav-btn mobile-only" onClick={toggle} style={{backgroundColor:"inherit"}}>
                    <i className="fa-solid fa-bars"></i>
                </button>
                <button className="icon-btn nav-btn desktop-only" onClick={() => navigate(-1)}>
                    <i className="fa-solid fa-angle-right"></i>
                </button>
                <button className="icon-btn nav-btn desktop-only" onClick={() => navigate(1)}>
                    <i className="fa-solid fa-angle-left"></i>
                </button>
            </div>

            <div className="navbar-center">
                <div className="search-container">
                    <input ref={searchInputRef} type="text" placeholder="חיפוש" className="search-input" value={searchQuery} onChange={handleSearchChange}/>
                </div>
                <i className="fa-solid fa-magnifying-glass search-icon"></i>
            </div>

            <div className="navbar-left">
                {isLoggedIn && <>
                    <NavLink to="/profile" className="icon-btn">
                        <i className="fa-solid fa-circle-user"></i>
                    </NavLink>
                </>}
            </div>
        </nav>
    );
};

export default Navbar;