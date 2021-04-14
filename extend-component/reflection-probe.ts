import { Component, TextureCube, _decorator, __private } from 'cc';
import { Cubemap } from './cubemap';

const { ccclass, type, property } = _decorator;

@ccclass('sync.ReflectionProbe')
export class ReflectionProbe extends Cubemap {
    @property
    radius = 0;
}
