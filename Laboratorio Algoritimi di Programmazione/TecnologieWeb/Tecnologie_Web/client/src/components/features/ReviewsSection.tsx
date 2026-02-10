import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import "../../styles/review.css";

interface Review {
    id: number;
    name: string;
    rating: number;
    comment: string;
    date: string;
    userId?: string;
}

const ReviewsSection: React.FC = () => {
    const { user, isAuthenticated, isAdmin } = useAuth();

    const [reviews, setReviews] = useState<Review[]>([]);
    const [formData, setFormData] = useState({
        rating: 5,
        comment: ''
    });
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);

    // Carica recensioni dal database
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch('http://localhost:8080/reviews');
                if (response.ok) {
                    const data = await response.json(); //Converto la risposta del server in un array JavaScript
                    setReviews(data);
                } else {
                    console.error('Errore nel caricamento delle recensioni');
                }
            } catch (error) {
                console.error('Errore nella chiamata API:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev, //copia i campi che c'erano prima
            [name]: name === 'rating' ? parseInt(value) : value //aggiorna solo il campo che è cambiato
        }));
    };

    // Invio recensione al server
    const handleSubmit = async () => {
        if (!isAuthenticated || !user) {
            alert('Devi essere loggato per lasciare una recensione.');
            return;
        }

        if (!formData.comment.trim()) {
            alert('Per favore, scrivi un commento.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: user.name,
                    rating: formData.rating,
                    comment: formData.comment.trim(),
                    userId: user.id
                }),
            });

            if (response.ok) {
                const newReview = await response.json();
                setReviews(prev => [newReview, ...prev]); //spread operator
                setFormData({ rating: 5, comment: '' });
                setShowForm(false);
                alert('Recensione aggiunta con successo!');
            } else {
                alert('Errore nel salvare la recensione');
            }
        } catch (error) {
            console.error('Errore:', error);
            alert('Errore di connessione');
        }
    };

    const canDeleteReview = (review: Review): boolean => {
        if (isAuthenticated && isAdmin()) {
            return true;
        }
        if (isAuthenticated && user && String(review.userId) === String(user.id)) {
            return true;
        }
        return false;
    };

    // Elimina recensione dal database
    const handleDeleteReview = async (reviewId: number, reviewName: string) => {
        if (window.confirm(`Sei sicuro di voler eliminare la recensione di ${reviewName}?`)) {
            try {
                const response = await fetch(`http://localhost:8080/reviews/${reviewId}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    setReviews(prev => prev.filter(review => review.id !== reviewId)); //mantiene tutte le recensioni meno quella con questo ID
                    alert('Recensione eliminata con successo!');
                } else {
                    alert('Errore nell\'eliminare la recensione');
                }
            } catch (error) {
                console.error('Errore:', error);
                alert('Errore di connessione');
            }
        }
    };

    const renderStars = (rating: number) => {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <p>Caricamento recensioni...</p>
            </div>
        );
    }

    return (
        <div className="reviews-container">
            <div className="reviews-header">
                <h2>Recensioni dei Clienti</h2>
                <p>Cosa dicono di noi i nostri clienti</p>
            </div>

            {isAuthenticated ? (
                <div className="add-review-section">
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="btn btn-primary"
                    >
                        {showForm ? 'Nascondi Form' : 'Aggiungi Recensione'}
                    </button>
                </div>
            ) : (
                <div className="login-message">
                    <p>Per lasciare una recensione, devi prima <strong>effettuare il login</strong>.</p>
                </div>
            )}

            {showForm && isAuthenticated && user && (
                <div className="review-form">
                    <h3>Lascia una Recensione</h3>
                    <div>
                        <div className="form-group">
                            <label>Nome</label>
                            <input
                                type="text"
                                value={user.name}
                                disabled
                                className="form-input disabled"
                            />
                            <small className="form-help">Nome del tuo account</small>
                        </div>

                        <div className="form-group">
                            <label>Voto</label>
                            <select
                                name="rating"
                                value={formData.rating}
                                onChange={handleInputChange}
                                className="form-select"
                            >
                                <option value={5}>5 stelle - Eccellente</option>
                                <option value={4}>4 stelle - Molto buono</option>
                                <option value={3}>3 stelle - Buono</option>
                                <option value={2}>2 stelle - Sufficiente</option>
                                <option value={1}>1 stella - Scarso</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Commento *</label>
                            <textarea
                                name="comment"
                                value={formData.comment}
                                onChange={handleInputChange}
                                required
                                rows={4}
                                className="form-textarea"
                            />
                        </div>

                        <div className="form-buttons">
                            <button
                                onClick={handleSubmit}
                                className="btn btn-success"
                            >
                                Invia Recensione
                            </button>
                            <button
                                onClick={() => setShowForm(false)}
                                className="btn btn-secondary"
                            >
                                Annulla
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="reviews-list">
                <h3>Recensioni ({reviews.length})</h3>
                {reviews.length === 0 ? (
                    <p>Nessuna recensione disponibile. Sii il primo a lasciarne una!</p>
                ) : (
                    reviews.map(review => (
                        <div key={review.id} className="review-card">
                            <div className="review-header">
                                <div className="review-user">
                                    <strong>{review.name}</strong>
                                    {isAuthenticated && isAdmin() && (
                                        <span className="admin-badge">ADMIN</span>
                                    )}
                                </div>
                                <div className="review-actions">
                                    <span className="review-date">{review.date}</span>
                                    {canDeleteReview(review) && (
                                        <button
                                            onClick={() => handleDeleteReview(review.id, review.name)}
                                            className="btn btn-delete"
                                            title={isAdmin() ? "Elimina recensione (ADMIN)" : "Elimina la tua recensione"}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="review-rating">
                                {renderStars(review.rating)}
                            </div>
                            <p className="review-comment">{review.comment}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReviewsSection;