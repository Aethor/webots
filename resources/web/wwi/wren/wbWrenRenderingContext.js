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

class WbWrenRenderingContext {}

WbWrenRenderingContext.VF_SELECTED_OUTLINE = 0x00000002; // flag for selected outlines
WbWrenRenderingContext.VF_NORMALS = 0x00040000; // Display mesh normals
WbWrenRenderingContext.VM_REGULAR = 0xFFF00000; // no special renderings, i.e. no outlines and no optional renderings from menu selection

WbWrenRenderingContext.PP_GTAO = 0;
WbWrenRenderingContext.PP_BLOOM = 1;
WbWrenRenderingContext.PP_HDR = 2;
WbWrenRenderingContext.PP_SMAA = 3;

export {WbWrenRenderingContext};
