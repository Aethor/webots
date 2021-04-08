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

import {arrayXPointerFloat} from './wbUtils.js';
import {WbGeometry} from './wbGeometry.js';

class WbElevationGrid extends WbGeometry {
  constructor(id, height, xDimension, xSpacing, zDimension, zSpacing, thickness) {
    super(id);
    this.height = height;
    this.xDimension = xDimension;
    this.xSpacing = xSpacing;
    this.zDimension = zDimension;
    this.zSpacing = zSpacing;
    this.thickness = thickness;

    this.wrenMesh = undefined;
  }

  delete() {
    _wr_static_mesh_delete(this.wrenMesh);

    super.delete();
  }

  createWrenObjects() {
    super.createWrenObjects();
    this.buildWrenMesh();
  }

  buildWrenMesh() {
    super.deleteWrenRenderable();

    _wr_static_mesh_delete(this.wrenMesh);
    this.wrenMesh = undefined;

    if (this.xDimension < 2 || this.zDimension < 2)
      return;

    if (this.xSpacing === 0.0 || this.zSpacing === 0.0)
      return;

    super.computeWrenRenderable();

    // Restore pickable state
    super.setPickable(this.pickable);

    // convert height values to float, pad with zeroes if necessary
    const numValues = this.xDimension * this.zDimension;
    const heightData = [];

    const availableValues = Math.min(numValues, this.height.length);
    for (let i = 0; i < availableValues; ++i)
      heightData[i] = this.height[i];

    const createOutlineMesh = super.isInBoundingObject();

    const heightDataPointer = arrayXPointerFloat(heightData);
    this.wrenMesh = _wr_static_mesh_unit_elevation_grid_new(this.xDimension, this.zDimension, heightDataPointer, this.thickness, createOutlineMesh);

    _free(heightDataPointer);

    // This must be done after WbGeometry::computeWrenRenderable() otherwise
    // the outline scaling is applied to the wrong WREN transform
    if (createOutlineMesh)
      this.updateLineScale();
    else
      this.updateScale();

    _wr_renderable_set_mesh(this.wrenRenderable, this.wrenMesh);
  }

  updateScale() {
    const scalePointer = _wrjs_array3(this.xSpacing, 1.0, this.zSpacing);
    _wr_transform_set_scale(this.wrenNode, scalePointer);
  }

  updateLineScale() {
    if (this.isAValidBoundingObject())
      return;

    const offset = _wr_config_get_line_scale() / this.LINE_SCALE_FACTOR;

    const scalePointer = _wrjs_array3(this.xSpacing, 1.0 + offset, this.zSpacing);

    _wr_transform_set_scale(this.wrenNode, scalePointer);
  }

  isSuitableForInsertionInBoundingObject() {
    const invalidDimensions = this.xDimension < 2 || this.zDimension < 2;
    const invalidSpacings = this.xSpacing <= 0.0 || this.zSpacing < 0.0;
    const invalid = invalidDimensions || invalidSpacings;

    return !invalid;
  }

  isAValidBoundingObject() {
    return this.isSuitableForInsertionInBoundingObject() && super.isAValidBoundingObject();
  }

  clone(customID) {
    this.useList.push(customID);
    return new WbElevationGrid(customID, this.height, this.xDimension, this.xSpacing, this.zDimension, this.zSpacing, this.thickness);
  }
}

export {WbElevationGrid};
