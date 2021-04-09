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

import {WbTriangleMeshGeometry} from './wbTriangleMeshGeometry.js';

class WbIndexedFaceSet extends WbTriangleMeshGeometry {
  constructor(id, coordIndex, normalIndex, texCoordIndex, coord, texCoord, normal, ccw) {
    super(id);

    this.coordIndex = coordIndex;
    this.normalIndex = normalIndex;
    this.texCoordIndex = texCoordIndex;

    this.coord = coord;
    this.texCoord = texCoord;
    this.normal = normal;

    this.ccw = ccw;
  }

  updateTriangleMesh() {
    this.triangleMesh.init(this.coord, this.coordIndex, this.normal, this.normalIndex, this.texCoord, this.texCoordIndex, this.ccw);
  }

  clone(customID) {
    this.useList.push(customID);
    return new WbIndexedFaceSet(customID, this.coordIndex, this.normalIndex, this.texCoordIndex, this.coord, this.texCoord, this.normal, this.ccw, this.normalPerVertex);
  }
}

export {WbIndexedFaceSet};
