// Copyright 1996-2021 Cyberbotics Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {WbAppearance} from './wbAppearance.js';
import {WbBaseNode} from './wbBaseNode.js';
import {WbPBRAppearance} from './wbPBRAppearance.js';
import {WbPointSet} from './wbPointSet.js';
import {WbWorld} from './wbWorld.js';
import {WbWrenShaders} from './../wren/wbWrenShaders.js';

import {Parser} from './../parser.js';

class WbShape extends WbBaseNode {
  constructor(id, castShadow, isPickable, geometry, appearance) {
    super(id);
    this.castShadow = castShadow;
    this.isPickable = isPickable;

    this.appearance = appearance;
    this.geometry = geometry;
  }

  delete(isBoundingObject) {
    if (typeof this.parent === 'undefined') {
      const index = WbWorld.instance.sceneTree.indexOf(this);
      WbWorld.instance.sceneTree.splice(index, 1);
    } else {
      const parent = WbWorld.instance.nodes.get(this.parent);
      if (typeof parent !== 'undefined') {
        if (isBoundingObject)
          parent.isBoundingObject = null;
        else {
          const index = parent.children.indexOf(this);
          parent.children.splice(index, 1);
        }
      }
    }

    if (typeof this.wrenMaterial !== 'undefined') {
      _wr_material_delete(this.wrenMaterial);
      this.wrenMaterial = undefined;
    }

    if (typeof this.appearance !== 'undefined')
      this.appearance.delete();

    if (typeof this.geometry !== 'undefined')
      this.geometry.delete();

    super.delete();
  }

  createWrenObjects() {
    super.createWrenObjects();
    if (typeof this.appearance !== 'undefined')
      this.appearance.createWrenObjects();

    if (typeof this.geometry !== 'undefined') {
      this.geometry.createWrenObjects();

      this.applyMaterialToGeometry();
    }
  }

  applyMaterialToGeometry() {
    if (!this.wrenMaterial)
      this.createWrenMaterial(ENUM.WR_MATERIAL_PHONG);

    if (this.geometry) {
      if (this.appearance instanceof WbAppearance) {
        if (this.appearance.wrenObjectsCreatedCalled)
          this.wrenMaterial = this.appearance.modifyWrenMaterial(this.wrenMaterial);
        else
          this.wrenMaterial = WbAppearance.fillWrenDefaultMaterial(this.wrenMaterial);
      } else if ((this.appearance instanceof WbPBRAppearance) && !(this.geometry instanceof WbPointSet)) {
        this.createWrenMaterial();
        if (this.appearance.wrenObjectsCreatedCalled)
          this.wrenMaterial = this.appearance.modifyWrenMaterial(this.wrenMaterial);
      } else
        this.wrenMaterial = WbAppearance.fillWrenDefaultMaterial(this.wrenMaterial);

      this.geometry.setWrenMaterial(this.wrenMaterial, this.castShadow);
    }
  }

  createWrenMaterial(type) {
    const defaultColor = _wrjs_array3(1.0, 1.0, 1.0);
    if (typeof this.wrenMaterial !== 'undefined')
      _wr_material_delete(this.wrenMaterial);

    if (type === ENUM.WR_MATERIAL_PHONG) {
      this.wrenMaterial = _wr_phong_material_new();
      _wr_phong_material_set_color(this.wrenMaterial, defaultColor);
      _wr_material_set_default_program(this.wrenMaterial, WbWrenShaders.phongShader());
    } else {
      this.wrenMaterial = _wr_pbr_material_new();
      _wr_pbr_material_set_base_color(this.wrenMaterial, defaultColor);
      _wr_material_set_default_program(this.wrenMaterial, WbWrenShaders.pbrShader());
    }
  }

  preFinalize() {
    super.preFinalize();

    if (typeof this.appearance !== 'undefined')
      this.appearance.preFinalize();

    if (typeof this.geometry !== 'undefined')
      this.geometry.preFinalize();

    this.updateAppearance();
  }

  postFinalize() {
    super.postFinalize();

    if (typeof this.appearance !== 'undefined')
      this.appearance.postFinalize();

    if (typeof this.geometry !== 'undefined')
      this.geometry.postFinalize();

    if (!super.isInBoundingObject()) {
      this.updateCastShadows();
      this.updateIsPickable();
    }
  }

  updateAppearance() {
    if (this.wrenObjectsCreatedCalled)
      this.applyMaterialToGeometry();
  }

  updateCastShadows() {
    if (super.isInBoundingObject())
      return;

    if (typeof this.geometry !== 'undefined')
      this.geometry.computeCastShadows(this.castShadow);
  }

  updateIsPickable() {
    if (super.isInBoundingObject())
      return;

    if (typeof this.geometry !== 'undefined')
      this.geometry.setPickable(this.isPickable);
  }

  updateBoundingObjectVisibility() {
    if (typeof this.geometry !== 'undefined')
      this.geometry.updateBoundingObjectVisibility();
  }

  async clone(customID) {
    let geometry, appearance;
    if (typeof this.geometry !== 'undefined') {
      geometry = this.geometry.clone('n' + Parser.undefinedID++);
      geometry.parent = customID;
      WbWorld.instance.nodes.set(geometry.id, geometry);
    }

    if (typeof this.appearance !== 'undefined') {
      appearance = await this.appearance.clone('n' + Parser.undefinedID++);
      appearance.parent = customID;
      WbWorld.instance.nodes.set(appearance.id, appearance);
    }

    this.useList.push(customID);
    return new WbShape(customID, this.castShadow, this.isPickable, geometry, appearance);
  }
}

export {WbShape};
