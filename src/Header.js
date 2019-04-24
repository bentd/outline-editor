// VENDOR
import React, { Component } from "react";

class Header extends Component {

  render() {
    return (this.props.focusedBullet.content == null) ? null : (
      <div className="w-100 h-100">
        <h1 className="display-1" id="root-bullet-content">
          { this.props.focusedBullet.content }
        </h1>
        <h1 className="display-5" id="root-bullet-note">
          { this.props.focusedBullet.note }
        </h1>
        <hr></hr>
      </div>
    )
  }

}

export default Header;
