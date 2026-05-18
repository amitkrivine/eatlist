import { useState, ReactNode } from "react";
import Restaurant from "../interfaces/Restaurant";
import Eatlist from "../interfaces/Eatlist";
import { Link } from "react-router-dom";

interface CarouselSectionProps {
    title: string | ReactNode;
    seeAll: string;
    seeAllTitle: string;
    data: any[];
    renderItem: (item: any) => ReactNode;
}

const CarouselSection = ({ title, seeAll, seeAllTitle, data, renderItem }: CarouselSectionProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerPage = 4;

    const handleNext = () => {
        if (currentIndex + itemsPerPage < data.length) {
            setCurrentIndex(currentIndex + itemsPerPage);
        }
    };

    const handlePrev = () => {
        if (currentIndex - itemsPerPage >= 0) {
            setCurrentIndex(currentIndex - itemsPerPage);
        }
    };

    const displayedItems = data.slice(currentIndex, currentIndex + itemsPerPage);

    if (!data.length) return null;

    return (
        <div className="restaurant-section">
            <div className="section-title">
                <h2 className="section-header" style={{fontWeight:600}}>{title}</h2>
                <Link to={`/${seeAll}`} className="see-all-link">
                    <span>{seeAllTitle}</span>
                    <i className="fa-solid fa-angles-left"></i>
                </Link>
            </div>
            <div className="carousel-container">
                <button className="carousel-arrow arrow-right" onClick={handlePrev} disabled={currentIndex === 0}>
                    <i className="fa-solid fa-arrow-right"></i>
                </button>

                <div className="restaurant-cards">
                    {displayedItems.map((item) => renderItem(item))}
                </div>

                <button className="carousel-arrow arrow-left" onClick={handleNext} disabled={currentIndex + itemsPerPage >= data.length}>
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
            </div>
        </div>
    );
};

export default CarouselSection;