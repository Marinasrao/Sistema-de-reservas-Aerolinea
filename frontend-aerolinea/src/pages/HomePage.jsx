import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import styles from './HomePage.module.css'
import HeroCarousel from '../components/HeroCarousel.jsx'
import DestinationAutocomplete from '../components/DestinationAutocomplete.jsx'

const API_BASE = 'http://localhost:8080/api'

const getStoredToken = auth => {
  return (
    auth?.token ||
    localStorage.getItem('token') ||
    localStorage.getItem('jwt') ||
    localStorage.getItem('jwtToken') ||
    localStorage.getItem('accessToken') ||
    ''
  )
}

const getStoredUser = auth => {
  if (auth?.user) return auth.user

  try {
    const storedUser = localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : null
  } catch {
    return null
  }
}

const HomePage = ({ auth }) => {
  const navigate = useNavigate()
  const [urlParams] = useSearchParams()

  const preselectedDestination = urlParams.get('destination') || ''

  const user = getStoredUser(auth)
  const token = getStoredToken(auth)
  const isLoggedIn = Boolean(user && token)

  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: preselectedDestination,
    date: '',
    returnDate: '',
    passengers: 1,
    tripType: 'roundtrip',
    flightClass: 'economy'
  })

  const [recommendations, setRecommendations] = useState([])
  const [reviewSummaries, setReviewSummaries] = useState({})
  const [loadingRecommendations, setLoadingRecommendations] = useState(true)

  const [categories, setCategories] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [favoriteIds, setFavoriteIds] = useState([])
  const [favoriteMessage, setFavoriteMessage] = useState('')

  const filteredCategories = categories

  const favoriteIdSet = useMemo(() => {
    return new Set(favoriteIds.map(Number))
  }, [favoriteIds])

  useEffect(() => {
    if (!preselectedDestination) return

    setSearchParams(prev => ({
      ...prev,
      destination: preselectedDestination
    }))

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }, [preselectedDestination])

  const handleSearch = e => {
    e.preventDefault()

    if (!searchParams.origin || !searchParams.destination || !searchParams.date)
      return

    let url = `/search-results?origin=${encodeURIComponent(
      searchParams.origin
    )}&destination=${encodeURIComponent(searchParams.destination)}&fromDate=${
      searchParams.date
    }`

    if (searchParams.tripType === 'roundtrip' && searchParams.returnDate) {
      url += `&toDate=${searchParams.returnDate}&tripType=roundtrip`
    }

    url += `&passengers=${searchParams.passengers}&flightClass=${searchParams.flightClass}`

    navigate(url)
  }

  useEffect(() => {
    ;(async () => {
      try {
        const r2 = await fetch(`${API_BASE}/recommendations/random`)
        const d2 = await r2.json().catch(() => [])

        setRecommendations(Array.isArray(d2) ? d2 : [])
      } catch (err) {
        console.error('Error cargando recomendaciones:', err)
        setRecommendations([])
      } finally {
        setLoadingRecommendations(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (!recommendations.length) {
      setReviewSummaries({})
      return
    }

    let alive = true

    const loadReviewSummaries = async () => {
      try {
        const visibleRecommendations = recommendations.slice(0, 10)

        const entries = await Promise.all(
          visibleRecommendations.map(async rec => {
            try {
              const res = await fetch(
                `${API_BASE}/reviews/recommendation/${rec.id}/summary`
              )

              if (!res.ok) {
                return [
                  rec.id,
                  {
                    averageRating: 0,
                    totalReviews: 0
                  }
                ]
              }

              const data = await res.json()

              return [
                rec.id,
                {
                  averageRating: Number(data.averageRating || 0),
                  totalReviews: Number(data.totalReviews || 0)
                }
              ]
            } catch {
              return [
                rec.id,
                {
                  averageRating: 0,
                  totalReviews: 0
                }
              ]
            }
          })
        )

        if (alive) {
          setReviewSummaries(Object.fromEntries(entries))
        }
      } catch {
        if (alive) {
          setReviewSummaries({})
        }
      }
    }

    loadReviewSummaries()

    return () => {
      alive = false
    }
  }, [recommendations])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}/categories`)

        if (!res.ok) {
          throw new Error('Error backend categorías')
        }

        const data = await res.json()
        setCategories(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Error al cargar categorías', err)
        setCategories([])
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    if (!isLoggedIn) return

    const fetchFavorites = async () => {
      try {
        const res = await fetch(`${API_BASE}/favorites`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!res.ok) {
          throw new Error('No se pudieron cargar los favoritos')
        }

        const data = await res.json()
        const ids = Array.isArray(data) ? data.map(item => item.id) : []
        setFavoriteIds(ids)
      } catch (err) {
        console.error('Error cargando favoritos:', err)
        setFavoriteIds([])
      }
    }

    fetchFavorites()
  }, [isLoggedIn, token])

  const getIconForCharacteristic = (name = '') => {
    const key = name.toLowerCase()

    if (key.includes('equipaje') || key.includes('valija')) return '🧳'
    if (key.includes('wifi') || key.includes('wi-fi')) return '📶'
    if (
      key.includes('comida') ||
      key.includes('almuerzo') ||
      key.includes('cena')
    )
      return '🍴'
    if (key.includes('asiento')) return '💺'
    if (key.includes('hora') || key.includes('tiempo')) return '⏱️'
    if (key.includes('prioridad')) return '⭐'
    if (key.includes('check')) return '🛂'
    if (key.includes('mascota') || key.includes('pet')) return '🐶'

    return '✔️'
  }

  const toggleCategory = categoryId => {
    const id = Number(categoryId)

    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleFavorite = async (e, recommendationId) => {
    e.preventDefault()
    e.stopPropagation()

    const id = Number(recommendationId)
    const alreadyFavorite = favoriteIdSet.has(id)

    setFavoriteIds(prev =>
      alreadyFavorite
        ? prev.filter(favId => Number(favId) !== id)
        : [...prev, id]
    )

    if (!isLoggedIn) {
      setFavoriteMessage(
        'Selección temporal. Iniciá sesión para guardar tus favoritos.'
      )

      setTimeout(() => {
        setFavoriteMessage('')
      }, 3000)

      return
    }

    try {
      const res = await fetch(`${API_BASE}/favorites/${id}`, {
        method: alreadyFavorite ? 'DELETE' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error('No se pudo actualizar el favorito')
      }

      const data = await res.json()
      const ids = Array.isArray(data) ? data.map(item => item.id) : []

      setFavoriteIds(ids)
      setFavoriteMessage(
        alreadyFavorite
          ? 'Eliminado de tus favoritos.'
          : 'Agregado a tus favoritos.'
      )

      setTimeout(() => {
        setFavoriteMessage('')
      }, 2500)
    } catch (err) {
      console.error('Error actualizando favorito:', err)

      setFavoriteIds(prev =>
        alreadyFavorite
          ? [...prev, id]
          : prev.filter(favId => Number(favId) !== id)
      )

      setFavoriteMessage(
        'No se pudo actualizar el favorito. Intentá nuevamente.'
      )

      setTimeout(() => {
        setFavoriteMessage('')
      }, 3000)
    }
  }

  const categoryIcons = {
    Nacionales: '🇦🇷',
    Internacionales: '🌍',
    'Low Cost': '💸',
    Premium: '👑'
  }

  const renderRatingStars = (value = 0) => {
    const rounded = Math.round(Number(value || 0))

    return Array.from({ length: 5 }, (_, index) => (
      <span key={index}>{index < rounded ? '★' : '☆'}</span>
    ))
  }

  return (
    <>
      <div className={styles.homeContainer}>
        <div className={styles.heroSection}>
          <HeroCarousel />

          <div className={styles.heroSearchOverlay}>
            <form onSubmit={handleSearch}>
              <div className={styles.searchTabs}>
                <button
                  type='button'
                  className={`${styles.tabButton} ${
                    searchParams.tripType === 'roundtrip' ? styles.active : ''
                  }`}
                  onClick={() =>
                    setSearchParams({ ...searchParams, tripType: 'roundtrip' })
                  }
                >
                  Ida y vuelta
                </button>

                <button
                  type='button'
                  className={`${styles.tabButton} ${
                    searchParams.tripType === 'oneway' ? styles.active : ''
                  }`}
                  onClick={() =>
                    setSearchParams({
                      ...searchParams,
                      tripType: 'oneway',
                      returnDate: ''
                    })
                  }
                >
                  Solo ida
                </button>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label>Origen</label>
                  <div className={styles.inputWithIcon}>
                    <span className={styles.locationIcon}>📍</span>
                    <DestinationAutocomplete
                      value={searchParams.origin}
                      onChange={text =>
                        setSearchParams({ ...searchParams, origin: text })
                      }
                      placeholder='Ciudad de origen'
                      inputProps={{
                        required: true,
                        className: styles.textInput
                      }}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>Destino</label>
                  <div className={styles.inputWithIcon}>
                    <span className={styles.locationIcon}>📍</span>
                    <DestinationAutocomplete
                      value={searchParams.destination}
                      onChange={text =>
                        setSearchParams({ ...searchParams, destination: text })
                      }
                      placeholder='Ciudad de destino'
                      inputProps={{
                        required: true,
                        className: styles.textInput
                      }}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>Fecha de salida</label>
                  <div className={styles.inputWithIcon}>
                    <span className={styles.calendarIcon}>📅</span>
                    <input
                      type='date'
                      value={searchParams.date}
                      onChange={e =>
                        setSearchParams({
                          ...searchParams,
                          date: e.target.value
                        })
                      }
                      required
                      className={styles.textInput}
                    />
                  </div>
                </div>

                {searchParams.tripType === 'roundtrip' && (
                  <div className={styles.inputGroup}>
                    <label>Fecha de regreso</label>
                    <div className={styles.inputWithIcon}>
                      <span className={styles.calendarIcon}>📅</span>
                      <input
                        type='date'
                        value={searchParams.returnDate}
                        onChange={e =>
                          setSearchParams({
                            ...searchParams,
                            returnDate: e.target.value
                          })
                        }
                        required
                        className={styles.textInput}
                      />
                    </div>
                  </div>
                )}

                <div className={styles.inputGroup}>
                  <label>Pasajeros</label>
                  <div className={styles.inputWithIcon}>
                    <span className={styles.locationIcon}>👥</span>
                    <input
                      type='number'
                      min='1'
                      max='10'
                      value={searchParams.passengers}
                      onChange={e =>
                        setSearchParams({
                          ...searchParams,
                          passengers: parseInt(e.target.value, 10) || 1
                        })
                      }
                      required
                      className={styles.textInput}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>Clase</label>
                  <div className={styles.inputWithIcon}>
                    <span className={styles.locationIcon}>💺</span>
                    <select
                      value={searchParams.flightClass}
                      onChange={e =>
                        setSearchParams({
                          ...searchParams,
                          flightClass: e.target.value
                        })
                      }
                      className={styles.textInput}
                    >
                      <option value='economy'>Económica</option>
                      <option value='business'>Ejecutiva</option>
                      <option value='first'>Primera</option>
                    </select>
                  </div>
                </div>
              </div>

              <button type='submit' className={styles.airlineSearchButton}>
                Buscar vuelos
              </button>
            </form>
          </div>
        </div>

        <section className={styles.categoriesSection}>
          <h3>Categorías destacadas</h3>

          {Array.isArray(categories) && categories.length > 0 ? (
            <div className={styles.categoriesGrid}>
              {categories.map(cat => (
                <div key={cat.id} className={styles.categoryCard}>
                  {cat.image ? (
                    <img
                      src={`http://localhost:8080/uploads/categories/${cat.image}`}
                      alt={cat.title}
                      className={styles.categoryImage}
                      loading='lazy'
                      onError={e => {
                        e.currentTarget.src = '/placeholder.jpg'
                      }}
                    />
                  ) : (
                    <div className={styles.noImage}>Sin imagen</div>
                  )}

                  <h4>{cat.title}</h4>

                  {cat.promoText && (
                    <p className={styles.categoryPromo}>{cat.promoText}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ opacity: 0.6 }}>No hay categorías disponibles</p>
          )}
        </section>

        <section className={styles.filterSection}>
          <h4 className={styles.filterTitle}>🎛️ Promociones por categorías</h4>

          <div className={styles.filterRow}>
            {filteredCategories.map(cat => (
              <label
                key={cat.id}
                className={`${styles.filterOption} ${
                  selectedCategories.includes(cat.id) ? styles.active : ''
                }`}
              >
                <input
                  type='checkbox'
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                />

                <span className={styles.filterIcon}>
                  {categoryIcons[cat.title] || '✈️'}
                </span>

                <span>{cat.title}</span>
              </label>
            ))}

            <div className={styles.filterActions}>
              <button
                className={styles.searchBtn}
                onClick={() => {
                  if (selectedCategories.length === 0) return
                  navigate(
                    `/category-results?categories=${selectedCategories.join(
                      ','
                    )}`
                  )
                }}
              >
                Buscar
              </button>

              <button
                className={styles.clearBtn}
                onClick={() => setSelectedCategories([])}
              >
                Limpiar
              </button>
            </div>
          </div>
        </section>

        <section className={styles.featuresSection}>
          <h3 className={styles.featuresTitle}>Características del vuelo</h3>

          <div className={styles.featuresGrid}>
            {categories.map(cat => (
              <div key={cat.id} className={styles.featuresCategory}>
                <h4 className={styles.featuresCategoryTitle}>{cat.title}</h4>

                {Array.isArray(cat.characteristics) &&
                cat.characteristics.length > 0 ? (
                  <ul className={styles.featuresList}>
                    {cat.characteristics.map(ch => (
                      <li key={ch.id} className={styles.featureItem}>
                        <span className={styles.featureIcon}>
                          {getIconForCharacteristic(ch.name)}
                        </span>
                        <span className={styles.featureText}>{ch.name}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.featuresEmpty}>
                    No hay características asignadas
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className={styles.recommendationsSection}>
          <h3>Recomendaciones para ti</h3>

          {favoriteMessage && (
            <div className={styles.favoriteMessage}>{favoriteMessage}</div>
          )}

          {loadingRecommendations ? (
            <p style={{ opacity: 0.6 }}>Cargando recomendaciones...</p>
          ) : (
            <div className={styles.recsGrid}>
              {recommendations.slice(0, 10).map(rec => {
                const imageName = rec.mainImage || null

                const imageSrc = imageName
                  ? `http://localhost:8080/uploads/recommendations/${imageName}`
                  : null

                const isFavorite = favoriteIdSet.has(Number(rec.id))

                const summary = reviewSummaries[rec.id]
                const totalReviews = Number(summary?.totalReviews || 0)
                const averageRating = Number(summary?.averageRating || 0)

                return (
                  <Link
                    to={`/recommendations/${rec.id}`}
                    key={rec.id}
                    className={`${styles.recCard} ${
                      isFavorite ? styles.recCardFavorite : ''
                    }`}
                  >
                    <button
                      type='button'
                      className={`${styles.favoriteButton} ${
                        isFavorite ? styles.favoriteButtonActive : ''
                      }`}
                      onClick={e => toggleFavorite(e, rec.id)}
                      aria-label={
                        isFavorite
                          ? 'Quitar de favoritos'
                          : 'Agregar a favoritos'
                      }
                      title={
                        isFavorite
                          ? 'Quitar de favoritos'
                          : 'Agregar a favoritos'
                      }
                    >
                      {isFavorite ? '♥' : '♡'}
                    </button>

                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={rec.title}
                        className={styles.recImage}
                        loading='lazy'
                        onError={e => {
                          e.currentTarget.src = '/placeholder.jpg'
                        }}
                      />
                    ) : (
                      <div className={styles.noImage}>Sin imagen</div>
                    )}

                    <div className={styles.recContent}>
                      <h4 className={styles.recTitle}>{rec.title}</h4>

                      {rec.departureDate && (
                        <p className={styles.recDates}>
                          Ida:{' '}
                          {new Date(rec.departureDate).toLocaleDateString(
                            'es-AR'
                          )}
                        </p>
                      )}

                      <div className={styles.recRating}>
                        {totalReviews > 0 ? (
                          <>
                            <span className={styles.recRatingStars}>
                              {renderRatingStars(averageRating)}
                            </span>

                            <span>
                              {averageRating.toFixed(1)} · {totalReviews}{' '}
                              {totalReviews === 1
                                ? 'valoración'
                                : 'valoraciones'}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className={styles.recRatingStars}>☆</span>
                            <span className={styles.recRatingEmpty}>
                              Sin valoraciones
                            </span>
                          </>
                        )}
                      </div>

                      <div className={styles.recBottomRow}>
                        <span className={styles.recPrice}>
                          {rec.price != null
                            ? `AR$ ${Number(rec.price).toLocaleString('es-AR')}`
                            : 'Precio no disponible'}
                        </span>
                      </div>

                      <p className={styles.recTaxes}>Tasas incluidas</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </>
  )
}

export default HomePage
