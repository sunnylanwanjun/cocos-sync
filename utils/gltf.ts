import { Vec3 } from "cc";
import { SyncMeshData } from "../asset/mesh";
import { base642arraybuffer } from "./editor";


export function toGltfMesh (mesh: SyncMeshData) {
    let gltf = {
        "asset": {
            "generator": "Khronos glTF Blender I/O v1.2.75",
            "version": "2.0"
        },
        "meshes": [
            {
                "name": mesh.meshName,
                "primitives": [] as any[]
            }
        ],
        "accessors": [] as any[],
        "bufferViews": [] as any[],
        "buffers": [] as any[]
    }

    let bufferIndex = 0;

    for (let mi = 0; mi < mesh.subMeshes.length; mi++) {
        let subMesh = mesh.subMeshes[mi];

        let primitive = {
            attributes: {
                POSITION: bufferIndex++,
                NORMAL: bufferIndex++,
                TEXCOORD_0: bufferIndex++
            },
            indices: bufferIndex++,
            mode: 4
        }

        gltf.meshes[0].primitives.push(primitive);

        let attributes = primitive.attributes;

        // accessors;
        gltf.accessors.push({
            bufferView: attributes.POSITION,
            componentType: 5126,
            count: subMesh.vertices.length / 3,
            type: "VEC3",
            min: Vec3.toArray([], mesh.min),
            max: Vec3.toArray([], mesh.max),
        })
        gltf.accessors.push({
            bufferView: attributes.NORMAL,
            componentType: 5126,
            count: subMesh.normals.length / 3,
            type: "VEC3"
        })
        gltf.accessors.push({
            bufferView: attributes.TEXCOORD_0,
            componentType: 5126,
            count: subMesh.uv.length / 2,
            type: "VEC2"
        })
        gltf.accessors.push({
            bufferView: primitive.indices,
            componentType: 5123,
            count: subMesh.indices.length,
            type: "SCALAR"
        })

        // bufferViews
        let byteOffset = 0;
        let bufferViews = gltf.bufferViews;

        bufferViews.push({
            buffer: mi,
            byteOffset: byteOffset,
            byteLength: subMesh.vertices.length * 4
        })
        byteOffset += bufferViews[bufferViews.length - 1].byteLength;

        bufferViews.push({
            buffer: mi,
            byteOffset: byteOffset,
            byteLength: subMesh.normals.length * 4
        })
        byteOffset += bufferViews[bufferViews.length - 1].byteLength;

        bufferViews.push({
            buffer: mi,
            byteOffset: byteOffset,
            byteLength: subMesh.uv.length * 4
        })
        byteOffset += bufferViews[bufferViews.length - 1].byteLength;

        bufferViews.push({
            buffer: mi,
            byteOffset: byteOffset,
            byteLength: subMesh.indices.length * 2
        })
        byteOffset += bufferViews[bufferViews.length - 1].byteLength;


        let buffer = new ArrayBuffer(byteOffset);
        let float32Buffer = new Float32Array(buffer, 0, bufferViews[primitive.indices].byteOffset / 4);
        let uint16Buffer = new Uint16Array(buffer);

        float32Buffer.set(subMesh.vertices, bufferViews[attributes.POSITION].byteOffset / 4);
        float32Buffer.set(subMesh.normals, bufferViews[attributes.NORMAL].byteOffset / 4);
        float32Buffer.set(subMesh.uv, bufferViews[attributes.TEXCOORD_0].byteOffset / 4);
        uint16Buffer.set(subMesh.indices, bufferViews[primitive.indices].byteOffset / 2);

        gltf.buffers.push({
            byteLength: byteOffset,
            uri: 'data:application/octet-stream;base64,' + base642arraybuffer.encode(buffer)
        })
    }

    return gltf;
}
