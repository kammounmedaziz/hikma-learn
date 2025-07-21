import React from "react";

class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      term: ""
    };
    this.debounceTimeout = null;
    this.handleTermChange = this.handleTermChange.bind(this);
    this.search = this.search.bind(this);
  }

  // Called on input change
  handleTermChange(event) {
    const newTerm = event.target.value;
    this.setState({ term: newTerm });

    // Clear previous debounce timer
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    // Set new debounce timer: after 300ms of no typing, trigger search
    this.debounceTimeout = setTimeout(() => {
      this.props.onSearch(newTerm);
    }, 300);
  }

  // Optional: keep form submit for backward compatibility
  search(event) {
    event.preventDefault();
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    this.props.onSearch(this.state.term);
  }

  componentWillUnmount() {
    // Clean up timeout if unmounting
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
  }

  render() {
    return (
      <div className="flex justify-center my-6">
        <form
          onSubmit={this.search}
          className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-2xl shadow-md border border-white/20"
        >
          <input
            type="text"
            placeholder="Search a city or airport..."
            className="px-4 py-2 rounded-xl text-white bg-transparent placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#a855f7] w-64 transition-all duration-300"
            value={this.state.term}
            onChange={this.handleTermChange}
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-[#f1636f] to-[#a855f7] hover:from-[#f1636f] hover:to-[#a855f7] text-white px-5 py-2 rounded-xl transition-all duration-300 shadow-md hover:shadow-[#a855f7]/50 hover:scale-[1.02]"
          >
            Search
          </button>
        </form>
      </div>
    );
  }
}

export default SearchBar;
