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

import {arrayXPointerFloat, arrayXPointerInt} from './wbUtils.js';
import {WbGeometry} from './wbGeometry.js';
import {WbMatrix4} from './utils/wbMatrix4.js';
import {WbTriangleMesh} from './wbTriangleMesh.js';
import {WbWrenMeshBuffers} from './utils/wbWrenMeshBuffers.js';
import {WbWrenRenderingContext} from './../wren/wbWrenRenderingContext.js';
import {WbWrenShaders} from './../wren/wbWrenShaders.js';

class WbTriangleMeshGeometry extends WbGeometry {
  delete() {
    _wr_static_mesh_delete(this.wrenMesh);

    this.deleteWrenRenderable();

    super.delete();
  }

  createWrenObjects() {
    super.createWrenObjects();

    this.buildWrenMesh(false);
  }

  deleteWrenRenderable() {
    if (this.normalsMaterial)
      _wr_material_delete(this.normalsMaterial);
    this.normalsMaterial = undefined;
    if (this.normalsRenderable)
      _wr_node_delete(this.normalsRenderable);
    this.normalsRenderable = undefined;

    super.deleteWrenRenderable();
  }

  buildWrenMesh(updateCache) {
    this.deleteWrenRenderable();
    _wr_static_mesh_delete(this.wrenMesh);
    this.wrenMesh = undefined;

    if (!this.triangleMesh.isValid)
      return;

    const createOutlineMesh = super.isInBoundingObject();

    this.computeWrenRenderable();

    // normals representation
    this.normalsMaterial = _wr_phong_material_new();
    _wr_material_set_default_program(this.normalsMaterial, WbWrenShaders.lineSetShader());
    _wr_phong_material_set_color_per_vertex(this.normalsMaterial, true);
    _wr_phong_material_set_transparency(this.normalsMaterial, 0.4);

    this.normalsRenderable = _wr_renderable_new();
    _wr_renderable_set_cast_shadows(this.normalsRenderable, false);
    _wr_renderable_set_receive_shadows(this.normalsRenderable, false);
    _wr_renderable_set_material(this.normalsRenderable, this.normalsMaterial, null);
    _wr_renderable_set_visibility_flags(this.normalsRenderable, WbWrenRenderingContext.VF_NORMALS);
    _wr_renderable_set_drawing_mode(this.normalsRenderable, ENUM.WR_RENDERABLE_DRAWING_MODE_LINES);
    _wr_transform_attach_child(this.wrenNode, this.normalsRenderable);

    // Restore pickable state
    super.setPickable(this.isPickable);

    const buffers = super.createMeshBuffers(this.estimateVertexCount(), this.estimateIndexCount());
    this.buildGeomIntoBuffers(buffers, new WbMatrix4(), !this.triangleMesh.areTextureCoordinatesValid);
    const vertexBufferPointer = arrayXPointerFloat(buffers.vertexBuffer);
    const normalBufferPointer = arrayXPointerFloat(buffers.normalBuffer);
    const texCoordBufferPointer = arrayXPointerFloat(buffers.texCoordBuffer);
    const unwrappedTexCoordsBufferPointer = arrayXPointerFloat(buffers.unwrappedTexCoordsBuffer);
    const indexBufferPointer = arrayXPointerInt(buffers.indexBuffer);
    this.wrenMesh = _wr_static_mesh_new(buffers.verticesCount, buffers.indicesCount, vertexBufferPointer, normalBufferPointer, texCoordBufferPointer,
      unwrappedTexCoordsBufferPointer, indexBufferPointer, createOutlineMesh);

    _free(vertexBufferPointer);
    _free(normalBufferPointer);
    _free(texCoordBufferPointer);
    _free(unwrappedTexCoordsBufferPointer);
    _free(indexBufferPointer);

    buffers.clear();

    _wr_renderable_set_mesh(this.wrenRenderable, this.wrenMesh);
  }

  estimateVertexCount() {
    if (!this.triangleMesh.isValid)
      return;

    return 3 * this.triangleMesh.numberOfTriangles;
  }

  estimateIndexCount() {
    if (!this.triangleMesh.isValid)
      return;

    return 3 * this.triangleMesh.numberOfTriangles;
  }

  buildGeomIntoBuffers(buffers, m, generateUserTexCoords) {
    if (!this.triangleMesh.isValid)
      return;

    const rm = m.extracted3x3Matrix();
    const n = this.triangleMesh.numberOfTriangles;

    let start = buffers.vertexIndex / 3;
    const vBuf = buffers.vertexBuffer;
    if (typeof vBuf !== 'undefined') {
      let i = buffers.vertexIndex;
      for (let t = 0; t < n; ++t) { // foreach triangle
        for (let v = 0; v < 3; ++v) { // foreach vertex
          WbWrenMeshBuffers.writeCoordinates(this.triangleMesh.vertex(t, v, 0), this.triangleMesh.vertex(t, v, 1), this.triangleMesh.vertex(t, v, 2), m, vBuf, i);
          i += 3;
        }
      }
    }

    const nBuf = buffers.normalBuffer;
    if (typeof nBuf !== 'undefined') {
      let i = buffers.vertexIndex;
      for (let t = 0; t < n; ++t) { // foreach triangle
        for (let v = 0; v < 3; ++v) { // foreach vertex
          WbWrenMeshBuffers.writeNormal(this.triangleMesh.normal(t, v, 0), this.triangleMesh.normal(t, v, 1), this.triangleMesh.normal(t, v, 2), rm, nBuf, i);
          i += 3;
        }
      }
    }

    const tBuf = buffers.texCoordBuffer;
    const utBuf = buffers.unwrappedTexCoordsBuffer;
    if (typeof tBuf !== 'undefined') {
      let i = start * buffers.texCoordSetsCount * 2;
      for (let t = 0; t < n; ++t) { // foreach triangle
        for (let v = 0; v < 3; ++v) { // foreach vertex
          tBuf[i] = this.triangleMesh.textureCoordinate(t, v, 0);
          tBuf[i + 1] = this.triangleMesh.textureCoordinate(t, v, 1);

          if (generateUserTexCoords) {
            utBuf[i] = this.triangleMesh.nonRecursiveTextureCoordinate(t, v, 0);
            utBuf[i + 1] = this.triangleMesh.nonRecursiveTextureCoordinate(t, v, 1);
          } else {
            utBuf[i] = this.triangleMesh.textureCoordinate(t, v, 0);
            utBuf[i + 1] = this.triangleMesh.textureCoordinate(t, v, 1);
          }
          i += 2;
        }
      }
    }

    const iBuf = buffers.indexBuffer;
    if (typeof iBuf !== 'undefined') {
      start = buffers.vertexIndex / 3;
      let i = buffers.index;
      for (let t = 0; t < n; ++t) { // foreach triangle
        for (let v = 0; v < 3; ++v) // foreach vertex
          iBuf[i++] = start + this.triangleMesh.index(t, v);
      }
      buffers.index = i;
    }

    buffers.vertexIndex = buffers.vertexIndex + this.estimateVertexCount() * 3;
  }

  preFinalize() {
    if (this.isPreFinalizeCalled)
      return;

    super.preFinalize();

    this.createTriangleMesh();
  }

  createTriangleMesh() {
    this.triangleMesh = new WbTriangleMesh();
    this.updateTriangleMesh();
  }

  updateTriangleMesh() {}
}

export {WbTriangleMeshGeometry};
