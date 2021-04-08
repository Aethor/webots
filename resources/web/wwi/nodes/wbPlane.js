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

import {WbGeometry} from './wbGeometry.js';

class WbPlane extends WbGeometry {
  constructor(id, size) {
    super(id);
    this.size = size;
  }

  delete() {
    _wr_static_mesh_delete(this.wrenMesh);

    super.delete();
  }

  createWrenObjects() {
    super.createWrenObjects();

    this.computeWrenRenderable();

    const createOutlineMesh = super.isInBoundingObject();
    const wrenMesh = _wr_static_mesh_unit_rectangle_new(createOutlineMesh);

    _wr_renderable_set_mesh(this.wrenRenderable, wrenMesh);

    this.updateSize();
  }

  updateSize() {
    if (super.isInBoundingObject())
      updateLineScale();
    else
      this.updateScale();
  }

  updateLineScale() {
    if (!this.isAValidBoundingObject())
      return;

    const offset = _wr_config_get_line_scale() / this.LINE_SCALE_FACTOR;

    // allow the bounding sphere to scale down
    const scaleY = 0.1 * Math.min(this.size.x, this.size.y);
    wr_transform_set_scale(this.wrenNode, _wrjs_array3(this.size.x * (1.0 + offset), scaleY, this.size.y * (1.0 + offset)));
  }

  updateScale() {
    // allow the bounding sphere to scale down
    const scaleY = 0.1 * Math.min(this.size.x, this.size.y);

    const scale = _wrjs_array3(this.size.x, scaleY, this.size.y);
    _wr_transform_set_scale(this.wrenNode, scale);
  }

  isSuitableForInsertionInBoundingObject() {
    return super.isSuitableForInsertionInBoundingObject() && !(this.size.x <= 0.0 || this.size.y <= 0.0);
  }

  clone(customID) {
    this.useList.push(customID);
    return new WbPlane(customID, this.size);
  }
}

export {WbPlane};
