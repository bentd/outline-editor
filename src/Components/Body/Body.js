// VENDOR
import React, { Component } from "react";
import uuidv1 from "uuid/v1";

// APP
import "./Body.css";
import * as Actions from "../../Actions/Actions.js";
import Bullet from "../Bullet/Bullet.js";

class Body extends Component {
  // this class shows the focused bullet's children
  // if the focus bullet has no children, a plus sign is rendered to add one

  addChild() {
    let newUUID = uuidv1();
    this.props.store.dispatch(Actions.addSubBullet(this.props.focused, newUUID));
  }

  render() {
    if (this.props.focusedBullet.children.length !== 0) {
      return (
        <div id="focused-bullet-children">
        { this.props.focusedBullet.children.map((child, index) =>
          <Bullet key={ child.id } address={ [...this.props.focused, child.id] } store={ this.props.store } self={ child }></Bullet>
        )}
        </div>
      )
    }
    if (this.props.focusedBullet.children.length === 0) {
      return (
        <div id="focused-bullet-children" className="ml-2">
          <button className="add-button" onClick={ this.addChild.bind(this) }>+</button>
        </div>
      )
    }
  }

}

export default Body;