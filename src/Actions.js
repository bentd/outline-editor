import $ from "jquery";
import uuidv1 from "uuid/v1";

const UPDATE_ACTIVE = "UPDATE_ACTIVE";
const UPDATE_ROOT = "UPDATE_ROOT";
const ADD_BULLET = "ADD_BULLET";
const EDIT_BULLET = "EDIT_BULLET";
const DELETE_BULLET = "DELETE_BULLET";
const INDENT_BULLET = "INDENT_BULLET";
const UNINDENT_BULLET = "UNINDENT_BULLET";
const MOVE_BULLET = "MOVE_BULLET";
const EDIT_BULLET_NOTE = "EDIT_BULLET_NOTE";
const GO_DOWN = "GO_DOWN";
const GO_UP = "GO_UP";
const TOGGLE_COLLAPSE = "TOGGLE_COLLAPSE";


function updateActive(position) {
  return {
    type: UPDATE_ACTIVE,
    exec: (state) => {
      state.active = position;
      return state;
    }
  }
}


function updateRoot(root) {
  return {
    type: UPDATE_ROOT,
    root,
    exec: (state) => {
      state.root = root;
      return state;
    }
  }
}

function addBullet(position, uuid) {
  return {
    type: ADD_BULLET,
    position,
    uuid,
    exec: (state) => {
      let childPosition = last(position);
      let parent = getNode(ancestors(position), state.root);
      parent.children.splice(childPosition+1, 0, createNode(uuid));
      focusNode({id: uuid});
      return state;
    }
  }
}

function editBullet(position, content) {
  return {
    type: EDIT_BULLET,
    position,
    content,
    exec: (state) => {
      let node = getNode(position.slice(), state.root);
      node.content = content;
      focusNode(node);
      return state;
    }
  }
}

function deleteBullet(position) {
  return {
    type: DELETE_BULLET,
    position,
    exec: (state) => {
      if (ancestors(position).length === 1 && last(position) === 0) {
        return state;
      }
      let parent = getNode(ancestors(position), state.root);
      let node = parent.children.splice(last(position), 1)[0];
      if (node.children.length > 0) { return state }
      if (last(position) > 0) {
        let siblingAbove = parent.children.slice(last(position)-1)[0];
        focusNode(siblingAbove);
        return state;
      }
      else {
        if (state.active.length > 0) {
          return state;
        }
        else {
          focusNode(parent);
          return state;
        }
      }
      return state;
    }
  }
}

function indentBullet(position) {
  return {
    type: INDENT_BULLET,
    position,
    exec: (state) => {
      if (last(position) === 0) { return state }
      let tree = getTree(ancestors(position), state.root);
      let oldParent = last(tree);
      let newParent = getNode([...ancestors(position), (last(position)-1)], state.root);
      let child = oldParent.children.splice(last(position),1)[0];
      newParent.children.push(child);
      tree.push(newParent);
      uncollapseTree(tree);
      focusNode(child);
      return state;
    }
  }
}

function unindentBullet(position) {
  return {
    type: UNINDENT_BULLET,
    position,
    exec: (state) => {
      if (position.length < 3) { return state }
      let parent = getNode(ancestors(position), state.root);
      let child = parent.children.splice(last(position), 1)[0];
      let newParent = getNode(ancestors(ancestors(position)), state.root);
      newParent.children.splice(last(ancestors(position))+1, 0, child);
      focusNode(child);
      return state;
    }
  }
}

function editBulletNote(position, content) {
  return {
    type: EDIT_BULLET_NOTE,
    position,
    content,
    exec: (state) => {
      let node = getNode(position.slice(), state.root);
      node.note = content;
      focusNodeNote(node);
      return state;
    }
  }
}

function moveBulletAsChild(childPosition, newParentPosition) {
  return {
    type: MOVE_BULLET,
    childPosition,
    newParentPosition,
    exec: (state) => {
      let newParent = getNode(newParentPosition.slice(), state.root);
      let oldParent = getNode(ancestors(childPosition), state.root);
      let child = oldParent.children.splice(last(childPosition), 1)[0];
      newParent.children.push(child);
      if ((childPosition.length === newParentPosition.length) &&
          (last(newParentPosition) > last(childPosition))) {
        uncollapseTree(getTree([...ancestors(newParentPosition), last(newParentPosition)-1], state.root));
        return state;
      }
      uncollapseTree(getTree(newParentPosition.slice(), state.root));
      focusNode(child);
      return state;
    }
  }
}

function moveBulletAsSibling(childPosition, newSiblingPosition, above) {
  return {
    type: MOVE_BULLET,
    childPosition,
    newSiblingPosition,
    above,
    exec: (state) => {
      let newParent = getNode(ancestors(newSiblingPosition), state.root);
      let oldParent = getNode(ancestors(childPosition), state.root);
      let child = oldParent.children.splice(last(childPosition), 1)[0];
      if (above) {
        newParent.children.splice(last(newSiblingPosition), 0, child);
      }
      else {
        newParent.children.splice(last(newSiblingPosition)+1, 0, child);
      }
      focusNode(child);
      return state;
    }
  }
}

function goDown(position) {
  return {
    type: GO_DOWN,
    position,
    exec: (state) => {
      let node = getNode(position.slice(), state.root);
      let parent = getNode(ancestors(position), state.root);

      if (!isCollapsed(node)) {
        let _childBelow = getNode(childBelow(position), state.root);
        focusNode(_childBelow);
        return state;
      }

      if(!isLastChild(position, parent)) {
        let _siblingBelow = getNode(siblingBelow(position), state.root);
        focusNode(_siblingBelow);
        return state;
      }

      else {
        if (isRootChild(position)) {
          return state;
        }
        else {
          let _position = position.slice();
          while(_position.length !== 1) {
            if (!isLastChild(_position, parent)) {
              focusNode(getNode(siblingBelow(_position), state.root));
              return state;
            }
            _position.pop();
            parent = getNode(ancestors(_position), state.root);
          }
        }
      }
      return state;
    }
  }
}

function goUp(position) {
  return {
    type: GO_UP,
    position,
    exec: (state) => {
      if (isFirstChild(position)) {
        if (!isRootChild(position)) {
          focusNode(getNode(ancestors(position), state.root));
          return state;
        }
        else {
          return state;
        }
      }
      if (!isFirstChild(position)) {
        let nodeAbove = [...ancestors(position), last(position)-1];
        let siblingAbove = getNode(nodeAbove, state.root);
        while (!isCollapsed(siblingAbove)) {
          siblingAbove = siblingAbove.children[siblingAbove.children.length-1];
        }
        focusNode(siblingAbove);
        return state;
      }
    }
  }
}

function toggleCollapse(position) {
  return {
    type: TOGGLE_COLLAPSE,
    exec: (state) => {
      let node = getNode(position.slice(), state.root);
      node.collapsed = !(node.collapsed);
      if (node.collapsed) {
        collapseNode(node);
      }
      else {
        uncollapseNode(node);
      }
      return state;
    }
  }
}

function getNode(indices, root) {
  let node = root[indices.shift()];
  while (indices.length > 0) {
    node = node.children[indices.shift()];
  }
  return node;
}

function getTree(indices, root) {
  let tree = [];
  let node = root[indices.shift()];
  tree.push(node)
  while (indices.length > 0) {
    node = node.children[indices.shift()];
    tree.push(node);
  }
  return tree;
}

function placeCaretAtEnd(el) {
  // https://stackoverflow.com/questions/4233265/contenteditable-set-caret-at-the-end-of-the-text-cross-browser/4238971
  // @Tim Down
  el.focus();
  if (typeof window.getSelection != "undefined"
          && typeof document.createRange != "undefined") {
      var range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
  } else if (typeof document.body.createTextRange != "undefined") {
      var textRange = document.body.createTextRange();
      textRange.moveToElementText(el);
      textRange.collapse(false);
      textRange.select();
  }
}

function focusNode(node, timeout=0) {
  setTimeout(() => {
    $(`#${node.id}`).find(".content").focus();
    placeCaretAtEnd($(`#${node.id}`).find(".content").get(0));
  }, timeout);
}

function focusNodeNote(node, timeout=0) {
  setTimeout(() => {
    $(`#${node.id}`).find(".note").focus();
    placeCaretAtEnd($(`#${node.id}`).find(".note").get(0));
  }, timeout);
}

function isCollapsed(node) {
  if (node.children.length === 0) {
    return true;
  }
  return ($(`#${node.id}`).find(".children").attr("class").indexOf("show")  === -1);
}

function hasChildren(node) {
  return (node.children.length > 0);
}

function isFirstChild(position) {
  return (last(position) === 0);
}

function isLastChild(position, parent) {
  return (last(position) === (parent.children.length - 1));
}

function isRootChild(position) {
  return (position.length === 2);
}

function uncollapseNode(node) {
  setTimeout(() => {
    $(`#${node.id}`).children(".collapse").addClass("show");
  }, 0);
}

function collapseNode(node) {
  setTimeout(() => {
    $(`#${node.id}`).children(".collapse").removeClass("show");
  }, 0);
}

function uncollapseTree(tree) {
  setTimeout(() => {
    tree.map(uncollapseNode);
  }, 0);
}

function collapseTree(tree) {
  setTimeout(() => {
    tree.map(node => {
      $(`#${node.id}`).children(".collapse").removeClass("show");
      return node;
    });
  }, 0);
}

function last(array) {
  return array.slice(-1)[0];
}

function siblingAbove(array) {
  return [...ancestors(array), last(array)-1];
}

function siblingBelow(array) {
  return [...ancestors(array), last(array)+1];
}

function childBelow(array) {
  return [...array, 0];
}

function ancestors(array) {
  return array.slice(0, -1);
}

function sameArray(array1, array2) {
  if (!(array1 instanceof Array) || !(array2 instanceof Array)) {
    return false;
  }

  if (array1.length !== array2.length) {
    return false;
  }

  for (var i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }
  return true;
}

function fixTree(node) {
  if (node.id === undefined) {
    node.id = uuidv1();
  }
  if (node.content === undefined) {
    node.content = "";
  }
  if (node.completed === undefined) {
    node.completed = false;
  }
  if (node.children === undefined) {
    node.children = [];
  }
  if (node.collapsed === undefined) {
    node.collapsed = true;
  }
  if (node.children.length > 0) {
    for (var i = 0; i < node.children.length; i++) {
      fixTree(node.children[i]);
    }
  }
}

function createNode(uuid=false) {
  return {
    id: (uuid ? uuid : uuidv1()),
    content: "",
    note: "",
    collapsed: true,
    completed: false,
    children: []
  }
}

export { UPDATE_ACTIVE,
         UPDATE_ROOT,
         ADD_BULLET,
         EDIT_BULLET,
         DELETE_BULLET,
         INDENT_BULLET,
         UNINDENT_BULLET,
         EDIT_BULLET_NOTE,
         MOVE_BULLET,
         GO_DOWN,
         GO_UP,
         TOGGLE_COLLAPSE,
         updateActive,
         updateRoot,
         addBullet,
         editBullet,
         deleteBullet,
         indentBullet,
         unindentBullet,
         editBulletNote,
         moveBulletAsChild,
         moveBulletAsSibling,
         toggleCollapse,
         getNode,
         getTree,
         goUp,
         goDown,
         focusNode,
         focusNodeNote,
         isFirstChild,
         isRootChild,
         isCollapsed,
         uncollapseNode,
         uncollapseTree,
         sameArray,
         fixTree,
         createNode };
