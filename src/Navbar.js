// VENDOR
import React, { Component } from "react";

// APP
import * as Actions from "./Actions.js";

class Navbar extends Component {

  navigateTo(index) {
    return () => {
      this.props.store.dispatch(Actions.updateFocused(this.props.focused.slice(0, index+1))); // focuses back to any of the parent bullets
    }
  }

  navigateHome() {
    this.props.store.dispatch(Actions.updateFocused([this.props.focused[0]])); // focuses back to the root bullet and its root children (completely zoomed out)
  }

  render() {
    // the 🏠 p tag would be the equivalent to the root bullet
    // the focus tree map starts at 1 because bullet 0 is the root bullet which isn't seen by the user
    // the navigateTo p tags allow the user to zoom out to any of the parent bullets in the focus tree
    return (
      <div className="d-flex flex-row m-0 ml-3 p-0">
        <p className="pr-2" onClick={ this.navigateHome.bind(this) }><span role="img" aria-label="home">🏠</span></p>
      { this.props.focusedTree.length > 1 &&
        this.props.focusedTree.slice(1, this.props.focusedTree.length).map((node, index) =>
        <p key={ index } className="pr-2" onClick={ this.navigateTo((index + 1)).bind(this) }>{ " > " }{ node.content }</p>
      )}
      </div>
    )
  }

}

export default Navbar;
