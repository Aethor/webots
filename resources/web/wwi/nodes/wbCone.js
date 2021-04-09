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

class WbCone extends WbGeometry {
  constructor(id, bottomRadius, height, subdivision, side, bottom) {
    super(id);
    this.bottomRadius = bottomRadius;
    this.height = height;
    this.subdivision = subdivision;
    this.side = side;
    this.bottom = bottom;
  }

  delete() {
    _wr_static_mesh_delete(this.wrenMesh);

    super.delete();
  }

  createWrenObjects() {
    super.createWrenObjects();

    if (!this.bottom && !this.side)
      return;

    this.computeWrenRenderable();

    this.wrenMesh = _wr_static_mesh_unit_cone_new(this.subdivision, this.side, this.bottom);

    _wr_renderable_set_mesh(this.wrenRenderable, this.wrenMesh);

    const scale = _wrjs_array3(this.bottomRadius, this.height, this.bottomRadius);
    _wr_transform_set_scale(this.wrenNode, scale);
  }

  clone(customID) {
    this.useList.push(customID);
    return new WbCone(customID, this.bottomRadius, this.height, this.subdivision, this.side, this.bottom);
  }
}

export {WbCone};
