// VENDOR
import React, { Component } from "react";
import uuidv1 from "uuid/v1";

// APP
import * as Actions from "./Actions.js";
import Bullet from "./Bullet.js";

class Body extends Component {

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
        <div id="focused-bullet-children">
          <button style={{ background: "transparent", outline: 0, border: 0 }} onClick={ this.addChild.bind(this) }>+</button>
        </div>
      )
    }
  }

}

export default Body;