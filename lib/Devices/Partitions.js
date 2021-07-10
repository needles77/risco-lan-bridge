/* 
 *  Package: risco-lan-bridge
 *  File: Partitions.js
 *  
 *  MIT License
 *  
 *  Copyright (c) 2021 TJForc
 *  
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *  
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *  
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */

'use strict';

const EventEmitter = require('events');

let eventMixin = require('../constants').eventMixin;


class Partition extends EventEmitter {
    constructor(Id, Label, PStatus) {
        super();
        this.Id = Id || 1;
        this.Label = Label || new String;
        this.PStatus = PStatus || '-----------------' ;
        this.FirstStatus = true;

        // a
        this.Alarm = false;
        // D
        this.Duress = false;
        // C
        this.FalseCode = false;
        // F
        this.Fire = false;
        // P
        this.Panic = false;
        // M
        this.Medic = false;
        // N
        this.NoActivity = false;
        // A
        this.Arm = false;
        // H
        this.HomeStay = false;
        // R
        // Ready: In the sense that the partition is capable of being armed
        this.Ready = false;
        // O
        // true if at least 1 zone of the partition is active
        // false if all the zones of the partition are inactive
        this.Open = false;
        // E
        this.Exist = false;
        // S
        this.ResetRequired = false;
        // 1
        this.GrpAArm = false;
        // 2
        this.GRPBArm = false;
        // 3
        this.GrpCArm = false;
        // 4
        this.GRPDArm = false;
        // T
        this.Trouble = false;
        if (this.Pstatus !== '-----------------') {
            this.Status = this.PStatus;
        }
    }

    set Status(value) {
        if ((value !== undefined) && (typeof(value) === 'string')){
            let StateArray = Array(
                ['a', 'this.Alarm', 'Alarm', 'StandBy'],
                ['D', 'this.Duress', 'Duress', 'Free'],
                ['C', 'this.FalseCode', 'FalseCode', 'CodeOk'],
                ['F', 'this.Fire', 'Fire', 'NoFire'],
                ['P', 'this.Panic', 'Panic', 'NoPanic'],
                ['M', 'this.Medic', 'Medic', 'NoMedic'],
                ['A', 'this.Arm', 'Armed', 'Disarmed'],
                ['H', 'this.HomeStay', 'HomeStay', 'HomeDisarmed'],
                ['R', 'this.Ready', 'Ready', 'NotReady'],
                ['O', 'this.Open', 'ZoneOpen', 'ZoneClosed'],
                ['S', 'this.ResetRequired', 'MemoryEvent', 'MemoryAck'],
                ['N', 'this.NoActivity', 'ActivityAlert', 'ActivityOk'],
                ['1', 'this.GrpAArm', 'GrpAArmed', 'GrpADisarmed'],
                ['2', 'this.GrpBArm', 'GrpBArmed', 'GrpBDisarmed'],
                ['3', 'this.GrpCArm', 'GrpCArmed', 'GrpCDisarmed'],
                ['4', 'this.GrpDArm', 'GrpDArmed', 'GrpDDisarmed'],
                ['T', 'this.Trouble', 'Trouble', 'Ok'],
            );
            StateArray.forEach(StateValue => {
                if (value.includes(StateValue[0])) {
                    if (!(eval(StateValue[1]))) {
                        if (!this.FirstStatus) {this.emit(`PStatusChanged`, this.Id, StateValue[2])};
                        if (!this.FirstStatus) {this.emit(StateValue[2], this.Id)};
                    }
                    eval(`${StateValue[1]} = true;`);
                } else {
                    if (eval(StateValue[1])) {
                        if (!this.FirstStatus) {this.emit(`PStatusChanged`, this.Id, StateValue[3])};
                        if (!this.FirstStatus) {this.emit(StateValue[3], this.Id)};
                    }
                    eval(`${StateValue[1]} = false;`);
                }
            });
            this.FirstStatus = false;
        }
    }
}

class PartitionsList extends Array {
    constructor(len) {
        if (len !== undefined) {
            super(len);
            for (let i = 0 ; i < len; i++) {
                this[i] = new Partition(i + 1);
            }
            // Add event capability
            this.prototype = Array.prototype;
            Object.assign(this.prototype, eventMixin);

            this.forEach(partitions => {
                partitions.on('PStatusChanged', (Id, EventStr) => {
                    this.emit('PStatusChanged', Id, EventStr);
                });
            });
        }
    }

    ById(value) {
        if ((this instanceof PartitionsList) && (value !== undefined)) {
            return this[value - 1];
          }
    }
}

module.exports = {
	Partition:  Partition,
    PartitionsList: PartitionsList
}