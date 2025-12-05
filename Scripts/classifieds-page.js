/**
 * classifieds-page.js
 * ZipZapZoi Classifieds – UI logic for listings on classifieds.html
 */

class ClassifiedsPage {
  constructor() {
    this.currentPage = 1;
    this.itemsPerPage = 12;
    this.listings = [];
    this.filteredListings = [];
    this.sortBy = 'newest';

    this.filters = {
      search: '',
      category: '',
      city: ''
    };

    this.init();
  }

  init() {
    console.log('ClassifiedsPage initialized');
    this.setupEventListeners();
    this.showPostSuccessIfNeeded();
    this.loadListings();
  }

  setupEventListeners() {
    const searchInput = document.getElementById('searchQuery');
    const cityInput = document.getElementById('filterCity');
    const btnSearch = document.getElementById('btnSearch');
    const categorySelect = document.getElementById('filterCategory');
    const sortSelect = document.getElementById('sortBy');

    if (btnSearch) {
      btnSearch.addEventListener('click', () => this.applyFilters());
    }

    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.applyFilters();
      });
    }

    if (cityInput) {
      cityInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.applyFilters();
      });
    }

    if (categorySelect) {
      categorySelect.addEventListener('change', (e) => {
        this.filters.category = e.target.value;
        this.applyFilters();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.sortListings();
        this.renderListings();
      });
    }
  }

  showPostSuccessIfNeeded() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('posted') === '1') {
      const toast = document.getElementById('postSuccessToast');
      if (toast) {
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 4000);
      }
    }
  }

  loadListings() {
    this.listings = [
      {
        id: 1,
        title: 'Classic Cruiser Bicycle',
        description: 'Vintage-style bicycle in great condition, perfect for city rides.',
        price: 150,
        category: 'hobbies',
        city: 'Brooklyn, NY',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9v9yKgLOhQIsSwjwmeFy5QtXAFnWc30xu6IY0LnJ-X2kdjEYiFxIy_TlwzmFiZLHxHYC8K3-cikVjDf53mPhx2wcEwfWl0usWA1rO4WwRl8Tt7J72SI7Bft6Hh8BAzSb9eTnqads583R9by_wZbb001_XkY3Dswbfe6wr9SUW4TYaSTcC8SJHs4iJW6r3Ks9vmggW7ZIz7Lk0SITn1FcS9s-JiXYjX7RqCev9NW22i_0z29CF6nnMeftwCszuh-Rr6lBZ3gygdXhV',
        seller: { name: 'Alex Rider', rating: 4.7 },
        views: 120,
        featured: true,
        verified: false,
        postedAt: new Date('2024-06-01T10:00:00')
      },
      {
        id: 2,
        title: 'Smartphone Pro X',
        description: 'Flagship smartphone with high-end camera and display.',
        price: 799,
        category: 'electronics',
        city: 'San Francisco, CA',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAE8y5ncRKtYD1yZr9DWwowTqNMAPuO9VG5Fi2IHTQXzSs4_8YR4fa3o6WEzO2QEApIAaESAp6Tt6kE5y3hssMaoVNpCssi1KWQqzyQCFGC5y0fNy9DbelP1opeHRyTb_F55jA1rxsRArHJ-_KWl7BlP-B0u-LvqAF4OBSYHIT6SDbg3XUD20SpqNyYIQkPkarSEq1hP1iBd-N9GbxdVaWD-ej4DJ624EQMHnjiACd8z2BAImB-mwVd76fjXAOkMU4lwdXRvMwUtHlu',
        seller: { name: 'Tech World', rating: 4.9 },
        views: 210,
        featured: true,
        verified: true,
        postedAt: new Date('2024-06-10T12:00:00')
      },
      {
        id: 3,
        title: 'Limited Edition Sneakers',
        description: 'Rare drop, lightly used, original box included.',
        price: 220,
        category: 'fashion',
        city: 'Los Angeles, CA',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_lhRrp4rXScKnSb29hVZWW23goH1OguRKVsw5ClKZXlNN99FpCZbydp9Bz7aAQWFqz7bIbHBNTjz-omhIh7IJ-bRKMQ4SBBjQwnwH-Z5g_GemjyH7JeaRHTnJdSXrvphkYnaYGnEE5NJyLkYRe7traJENt54SAUi_FbVjVloQJo-fwRY7IX6DPIL3b7D7qThHyfkYKGt36XvjXxUy5mdoT62mZLOpFIFjt7NMGvplvL5vjAqed3uiLk2PJW7RvuxpzOmk1tdXB0k2',
        seller: { name: 'Sneaker Hub', rating: 4.8 },
        views: 180,
        featured: false,
        verified: true,
        postedAt: new Date('2024-06-05T09:00:00')
      },
      {
        id: 4,
        title: 'Mid-Century Armchair',
        description: 'Comfortable leather armchair, perfect for living room.',
        price: 450,
        category: 'home',
        city: 'Chicago, IL',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbLtS3fb_ApdSUEMaSeJdUgnQqokXCOoU-D5CXuelweF9zsK3ezT6my4lj_kvO4SZKqOh9z32yhNWuzx-fNJQd-qPLOSPuqP37K5uWC0VkTv0L-EHB19jrTnq65wh8UeGIfD7LfDPomL4ds34nWmzUvTpxh0fq5Rh6txhoUhPluS683EAHWNTlu1q-cjUSyRokNlEj-JloKaYHT8IIcsnJl7d3Mk_oMj68JzoTRx0jkZu0NYeWydZKtJW-IWSjz2ACAuQXZpoQ-s1N',
        seller: { name: 'Home Studio', rating: 4.6 },
        views: 95,
        featured: false,
        verified: false,
        postedAt: new Date('2024-05-28T15:00:00')
      }
    ];

    this.applyFilters();
  }

  applyFilters() {
    const searchInput = document.getElementById('searchQuery');
    const cityInput = document.getElementById('filterCity');

    this.filters.search = (searchInput?.value || '').trim().toLowerCase();
    const rawCity = (cityInput?.value || '').trim().toLowerCase();

    this.filteredListings = this.listings.filter((listing) => {
      if (this.filters.search) {
        const haystack = (listing.title + ' ' + listing.description).toLowerCase();
        if (!haystack.includes(this.filters.search)) return false;
      }

      if (this.filters.category && listing.category !== this.filters.category) {
        return false;
      }

      if (rawCity) {
        if (!listing.city.toLowerCase().includes(rawCity)) return false;
      }

      return true;
    });

    this.currentPage = 1;
    this.sortListings();
    this.renderListings();
  }

  sortListings() {
    const sort = this.sortBy;
    this.filteredListings.sort((a, b) => {
      if (sort === 'price-low') return a.price - b.price;
      if (sort === 'price-high') return b.price - a.price;
      return new Date(b.postedAt) - new Date(a.postedAt);
    });
  }

  renderListings() {
    const grid = document.getElementById('listingsGrid');
    if (!grid) return;

    if (!this.filteredListings.length) {
      grid.innerHTML = `
        <div class="col-span-full text-center py-10 text-text-light/70 dark:text-text-dark/70">
          <p class="text-lg font-semibold">No listings found.</p>
          <p class="text-sm mt-1">Try changing your search or filters.</p>
        </div>
      `;
      return;
    }

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    const pageItems = this.filteredListings.slice(start, end);

    grid.innerHTML = pageItems.map((listing) => this.createListingCard(listing)).join('');
  }

  createListingCard(listing) {
    const formattedPrice = `$${listing.price}`;

    return `
      <a
        href="Listing Detail.html?id=${listing.id}"
        class="group bg-surface-light dark:bg-surface-dark rounded-lg overflow-hidden shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-300 border border-border-light dark:border-border-dark block"
        data-id="${listing.id}"
      >
        <div
          class="w-full aspect-square bg-cover bg-center"
          style="background-image: url('${listing.image}')"
        ></div>
        <div class="p-4">
          <h3 class="font-bold text-lg truncate">${listing.title}</h3>
          <p class="text-2xl font-bold text-secondary dark:text-primary mt-1">${formattedPrice}</p>
          <p class="text-sm text-text-light/60 dark:text-text-dark/60 mt-1">${listing.city}</p>
        </div>
      </a>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.classifiedsPage = new ClassifiedsPage();
});
