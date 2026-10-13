import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  RiSearchLine,
  RiShoppingBag3Line,
  RiHeart3Line,
  RiUser3Line,
  RiMenuLine,
  RiCloseLine,
  RiArrowDownSLine,
  RiDashboardLine,
  RiLogoutBoxRLine,
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import productService from '../../services/productService';
import { formatPrice } from '../../utils/formatters';
import useDebounce from '../../hooks/useDebounce';

const Navbar = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, isAdmin, logout, openLoginModal } = useAuth();
  const { totalItems, openDrawer } = useCart();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // Debounced search query (400ms)
  const debouncedQuery = useDebounce(searchQuery, 400);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let isMounted = true;
    setIsSearching(true);
    productService
      .searchProducts(debouncedQuery)
      .then((results) => {
        if (isMounted) {
          setSearchResults(results.slice(0, 5));
        }
      })
      .catch(() => {
        if (isMounted) setSearchResults([]);
      })
      .finally(() => {
        if (isMounted) setIsSearching(false);
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      setShowMobileSearch(false);
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectResult = (slug) => {
    setShowSearchDropdown(false);
    setShowMobileSearch(false);
    setSearchQuery('');
    navigate(`/product/${slug}`);
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-navbar)',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 'var(--navbar-height)',
          padding: '0 24px',
          maxWidth: '1600px',
          margin: '0 auto',
        }}
      >
        {/* Left: Mobile hamburger & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle Navigation Menu"
            style={{
              display: 'none',
              padding: '6px',
              color: 'var(--color-primary-dark)',
            }}
            className="mobile-menu-btn"
          >
            <RiMenuLine size={24} />
          </button>

          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/logo.jpg"
              alt="Leo Paints Logo"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                objectFit: 'cover',
                border: '1px solid var(--color-border)',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.25rem',
                  fontWeight: '800',
                  color: 'var(--color-primary)',
                  letterSpacing: '0.8px',
                  lineHeight: 1,
                }}
              >
                LEO PAINTS
              </span>
              <span
                style={{
                  fontSize: '0.625rem',
                  color: '#C7A600',
                  fontWeight: '700',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  lineHeight: 1.2,
                }}
              >
                ROYAL COATINGS
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Search Bar with Debounce & Dropdown */}
        <div
          ref={searchRef}
          style={{
            position: 'relative',
            flex: '0 1 480px',
            margin: '0 20px',
          }}
          className="navbar-search-desktop"
        >
          <form onSubmit={handleSearchSubmit}>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <input
                type="text"
                placeholder="Search emulsions, exterior shields, primers, colors..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 40px 0 16px',
                  backgroundColor: 'var(--color-bg-page)',
                  border: '1.5px solid transparent',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.875rem',
                  transition: 'all var(--transition-fast)',
                }}
                className="nav-search-input"
              />
              <button
                type="submit"
                aria-label="Search"
                style={{
                  position: 'absolute',
                  right: '12px',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <RiSearchLine size={20} />
              </button>
            </div>
          </form>

          {/* Autocomplete Dropdown */}
          {showSearchDropdown && searchQuery.trim().length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-card)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
                zIndex: 10,
              }}
            >
              {isSearching ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  Searching catalog...
                </div>
              ) : searchResults.length > 0 ? (
                <div style={{ padding: '8px 0' }}>
                  <div
                    style={{
                      padding: '6px 16px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: 'var(--color-text-muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Suggested Products
                  </div>
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleSelectResult(product.slug)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 16px',
                        cursor: 'pointer',
                        transition: 'background-color var(--transition-fast)',
                      }}
                      className="search-item-hover"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '6px',
                          objectFit: 'cover',
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: 'var(--color-text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {product.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          {product.categoryName} • <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>{formatPrice(product.price)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div
                    onClick={handleSearchSubmit}
                    style={{
                      padding: '10px 16px',
                      borderTop: '1px solid var(--color-border)',
                      textAlign: 'center',
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                      color: 'var(--color-primary)',
                      cursor: 'pointer',
                      backgroundColor: 'var(--color-bg-page)',
                    }}
                  >
                    View all results for "{searchQuery}"
                  </div>
                </div>
              ) : (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No matching paints found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Mobile search toggle */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            aria-label="Search"
            style={{
              display: 'none',
              padding: '8px',
              color: 'var(--color-text-primary)',
            }}
            className="mobile-search-btn"
          >
            <RiSearchLine size={22} />
          </button>

          {/* Wishlist Link */}
          <Link
            to="/wishlist"
            aria-label="View Wishlist"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              color: 'var(--color-primary-dark)',
              transition: 'background-color var(--transition-fast)',
            }}
            className="nav-icon-btn"
          >
            <RiHeart3Line size={22} />
          </Link>

          {/* Cart Drawer Trigger */}
          <button
            onClick={openDrawer}
            aria-label={`Cart with ${totalItems} items`}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              color: 'var(--color-primary-dark)',
              transition: 'background-color var(--transition-fast)',
            }}
            className="nav-icon-btn"
          >
            <RiShoppingBag3Line size={22} />
            {totalItems > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  backgroundColor: 'var(--color-accent)',
                  color: '#FFFFFF',
                  fontSize: '0.6875rem',
                  fontWeight: '700',
                  minWidth: '18px',
                  height: '18px',
                  borderRadius: '999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  lineHeight: 1,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                {totalItems}
              </span>
            )}
          </button>

          {/* User Account / Login */}
          <div ref={userMenuRef} style={{ position: 'relative' }}>
            {isAuthenticated ? (
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-btn)',
                  backgroundColor: 'var(--color-primary-subtle)',
                  color: 'var(--color-primary-dark)',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8125rem',
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="user-name-label">{user?.name ? user.name.split(' ')[0] : 'Profile'}</span>
                <RiArrowDownSLine size={16} />
              </button>
            ) : (
              <button
                onClick={openLoginModal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-btn)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  transition: 'background-color var(--transition-fast)',
                }}
                className="login-btn-top"
              >
                <RiUser3Line size={16} />
                <span>Login</span>
              </button>
            )}

            {/* Profile Dropdown Menu */}
            {isAuthenticated && showUserMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '210px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-card)',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--color-border)',
                  padding: '8px 0',
                  zIndex: 20,
                }}
              >
                <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{user?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{user?.phone}</div>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setShowUserMenu(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 16px',
                    fontSize: '0.875rem',
                    color: 'var(--color-text-primary)',
                  }}
                  className="dropdown-menu-item"
                >
                  <RiUser3Line size={18} />
                  My Account & Orders
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setShowUserMenu(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 16px',
                      fontSize: '0.875rem',
                      color: 'var(--color-primary)',
                      fontWeight: '600',
                    }}
                    className="dropdown-menu-item"
                  >
                    <RiDashboardLine size={18} />
                    Admin Portal
                  </Link>
                )}

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 16px',
                    fontSize: '0.875rem',
                    color: 'var(--color-danger)',
                    borderTop: '1px solid var(--color-border)',
                    textAlign: 'left',
                  }}
                  className="dropdown-menu-item"
                >
                  <RiLogoutBoxRLine size={18} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search bar expands */}
      {showMobileSearch && (
        <div style={{ padding: '8px 16px 12px', borderTop: '1px solid var(--color-border)' }}>
          <form onSubmit={handleSearchSubmit}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search Leo Paints products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 36px 0 14px',
                  backgroundColor: 'var(--color-bg-page)',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.875rem',
                }}
              />
              <button
                type="submit"
                style={{ position: 'absolute', right: '12px', color: 'var(--color-primary)' }}
              >
                <RiSearchLine size={18} />
              </button>
            </div>
          </form>
        </div>
      )}

      <style>{`
        .nav-search-input:focus {
          border-color: var(--color-primary) !important;
          background-color: #FFFFFF !important;
          box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
        }
        .nav-icon-btn:hover {
          background-color: var(--color-bg-page);
        }
        .search-item-hover:hover {
          background-color: var(--color-bg-page);
        }
        .dropdown-menu-item:hover {
          background-color: var(--color-bg-page);
        }
        .login-btn-top:hover {
          background-color: var(--color-primary-light);
        }
        @media (max-width: 768px) {
          .mobile-menu-btn, .mobile-search-btn {
            display: flex !important;
          }
          .navbar-search-desktop {
            display: none !important;
          }
          .user-name-label {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
