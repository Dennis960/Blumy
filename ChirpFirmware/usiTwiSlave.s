	.file	"usiTwiSlave.c"
__SREG__ = 0x3f
__SP_H__ = 0x3e
__SP_L__ = 0x3d
__CCP__  = 0x34
__tmp_reg__ = 0
__zero_reg__ = 1
	.section	.text.usiTwiSlaveInit,"ax",@progbits
.global	usiTwiSlaveInit
	.type	usiTwiSlaveInit, @function
usiTwiSlaveInit:
/* prologue: function */
/* frame size = 0 */
	sts rxTail,__zero_reg__
	sts rxHead,__zero_reg__
	sts txTail,__zero_reg__
	sts txHead,__zero_reg__
	sts slaveAddress,r24
	sts inPacket,__zero_reg__
	in r24,58-32
	ori r24,lo8(80)
	out 58-32,r24
	sbi 59-32,4
	sbi 59-32,6
	cbi 58-32,6
	ldi r24,lo8(-88)
	out 45-32,r24
	ldi r24,lo8(-16)
	out 46-32,r24
/* epilogue start */
	ret
	.size	usiTwiSlaveInit, .-usiTwiSlaveInit
	.section	.text.usiTwiTransmitByte,"ax",@progbits
.global	usiTwiTransmitByte
	.type	usiTwiTransmitByte, @function
usiTwiTransmitByte:
/* prologue: function */
/* frame size = 0 */
	mov r18,r24
	lds r25,txHead
	subi r25,lo8(-(1))
	andi r25,lo8(15)
.L4:
	lds r24,txTail
	cp r25,r24
	breq .L4
	mov r30,r25
	ldi r31,lo8(0)
	subi r30,lo8(-(txBuf))
	sbci r31,hi8(-(txBuf))
	st Z,r18
	sts txHead,r25
/* epilogue start */
	ret
	.size	usiTwiTransmitByte, .-usiTwiTransmitByte
	.section	.text.usiTwiReceiveByte,"ax",@progbits
.global	usiTwiReceiveByte
	.type	usiTwiReceiveByte, @function
usiTwiReceiveByte:
/* prologue: function */
/* frame size = 0 */
.L8:
	lds r25,rxHead
	lds r24,rxTail
	cp r25,r24
	breq .L8
	lds r24,rxTail
	subi r24,lo8(-(1))
	andi r24,lo8(15)
	sts rxTail,r24
	lds r30,rxTail
	ldi r31,lo8(0)
	subi r30,lo8(-(rxBuf))
	sbci r31,hi8(-(rxBuf))
	ld r24,Z
/* epilogue start */
	ret
	.size	usiTwiReceiveByte, .-usiTwiReceiveByte
	.section	.text.usiTwiDataInReceiveBuffer,"ax",@progbits
.global	usiTwiDataInReceiveBuffer
	.type	usiTwiDataInReceiveBuffer, @function
usiTwiDataInReceiveBuffer:
/* prologue: function */
/* frame size = 0 */
	lds r25,rxHead
	lds r24,rxTail
	ldi r18,lo8(0)
	cpse r25,r24
	ldi r18,lo8(1)
.L12:
	mov r24,r18
/* epilogue start */
	ret
	.size	usiTwiDataInReceiveBuffer, .-usiTwiDataInReceiveBuffer
	.section	.text.usiTwiOnStart,"ax",@progbits
.global	usiTwiOnStart
	.type	usiTwiOnStart, @function
usiTwiOnStart:
/* prologue: function */
/* frame size = 0 */
	sts (usiTwiOnStartFunction)+1,r25
	sts usiTwiOnStartFunction,r24
/* epilogue start */
	ret
	.size	usiTwiOnStart, .-usiTwiOnStart
	.section	.text.usiTwiOnStop,"ax",@progbits
.global	usiTwiOnStop
	.type	usiTwiOnStop, @function
usiTwiOnStop:
/* prologue: function */
/* frame size = 0 */
	sts (usiTwiOnStopFunction)+1,r25
	sts usiTwiOnStopFunction,r24
/* epilogue start */
	ret
	.size	usiTwiOnStop, .-usiTwiOnStop
	.section	.text.__vector_15,"ax",@progbits
.global	__vector_15
	.type	__vector_15, @function
__vector_15:
	push __zero_reg__
	push r0
	in r0,__SREG__
	push r0
	clr __zero_reg__
	push r24
/* prologue: Signal */
/* frame size = 0 */
	sts (overflowState)+1,__zero_reg__
	sts overflowState,__zero_reg__
	cbi 58-32,6
.L20:
	sbis 57-32,4
	rjmp .L19
	sbis 57-32,6
	rjmp .L20
.L19:
	sbis 57-32,6
	rjmp .L21
	sbic 57-32,4
	rjmp .L22
.L21:
	ldi r24,lo8(-8)
	rjmp .L26
.L22:
	ldi r24,lo8(-88)
.L26:
	out 45-32,r24
	ldi r24,lo8(-16)
	out 46-32,r24
/* epilogue start */
	pop r24
	pop r0
	out __SREG__,r0
	pop r0
	pop __zero_reg__
	reti
	.size	__vector_15, .-__vector_15
	.section	.text.__vector_16,"ax",@progbits
.global	__vector_16
	.type	__vector_16, @function
__vector_16:
	push __zero_reg__
	push r0
	in r0,__SREG__
	push r0
	clr __zero_reg__
	push r18
	push r19
	push r20
	push r21
	push r22
	push r23
	push r24
	push r25
	push r26
	push r27
	push r30
	push r31
/* prologue: Signal */
/* frame size = 0 */
	lds r24,overflowState
	lds r25,(overflowState)+1
	cpi r24,2
	cpc r25,__zero_reg__
	brne .+2
	rjmp .L31
	cpi r24,3
	cpc r25,__zero_reg__
	brsh .L35
	sbiw r24,0
	breq .L29
	sbiw r24,1
	breq .+2
	rjmp .L43
	rjmp .L30
.L35:
	cpi r24,4
	cpc r25,__zero_reg__
	brne .+2
	rjmp .L33
	cpi r24,4
	cpc r25,__zero_reg__
	brlo .L32
	sbiw r24,5
	breq .+2
	rjmp .L43
	rjmp .L52
.L29:
	in r24,47-32
	tst r24
	breq .L36
	in r24,47-32
	lsr r24
	lds r25,slaveAddress
	cp r24,r25
	brne .L49
.L36:
	lds r30,usiTwiOnStartFunction
	lds r31,(usiTwiOnStartFunction)+1
	sbiw r30,0
	breq .L38
	icall
.L38:
	sbis 47-32,0
	rjmp .L51
	ldi r24,lo8(1)
	ldi r25,hi8(1)
	rjmp .L50
.L32:
	in r24,47-32
	tst r24
	breq .L30
.L49:
	ldi r24,lo8(-88)
	out 45-32,r24
	rjmp .L48
.L30:
	lds r25,txHead
	lds r24,txTail
	cp r25,r24
	breq .L41
	lds r24,txTail
	subi r24,lo8(-(1))
	andi r24,lo8(15)
	sts txTail,r24
	lds r30,txTail
	ldi r31,lo8(0)
	subi r30,lo8(-(txBuf))
	sbci r31,hi8(-(txBuf))
	ld r24,Z
	rjmp .L45
.L41:
	ldi r24,lo8(-1)
.L45:
	out 47-32,r24
	ldi r24,lo8(2)
	ldi r25,hi8(2)
	sts (overflowState)+1,r25
	sts overflowState,r24
	sbi 58-32,6
.L48:
	ldi r24,lo8(112)
	rjmp .L47
.L31:
	ldi r24,lo8(3)
	ldi r25,hi8(3)
	sts (overflowState)+1,r25
	sts overflowState,r24
	cbi 58-32,6
	out 47-32,__zero_reg__
	rjmp .L46
.L33:
	ldi r24,lo8(5)
	ldi r25,hi8(5)
	sts (overflowState)+1,r25
	sts overflowState,r24
	cbi 58-32,6
	rjmp .L48
.L52:
	lds r24,rxHead
	subi r24,lo8(-(1))
	andi r24,lo8(15)
	sts rxHead,r24
	lds r30,rxHead
	in r24,47-32
	ldi r31,lo8(0)
	subi r30,lo8(-(rxBuf))
	sbci r31,hi8(-(rxBuf))
	st Z,r24
.L51:
	ldi r24,lo8(4)
	ldi r25,hi8(4)
.L50:
	sts (overflowState)+1,r25
	sts overflowState,r24
	out 47-32,__zero_reg__
	sbi 58-32,6
.L46:
	ldi r24,lo8(126)
.L47:
	out 46-32,r24
.L43:
/* epilogue start */
	pop r31
	pop r30
	pop r27
	pop r26
	pop r25
	pop r24
	pop r23
	pop r22
	pop r21
	pop r20
	pop r19
	pop r18
	pop r0
	out __SREG__,r0
	pop r0
	pop __zero_reg__
	reti
	.size	__vector_16, .-__vector_16
	.section	.bss.slaveAddress,"aw",@nobits
	.type	slaveAddress, @object
	.size	slaveAddress, 1
slaveAddress:
	.skip 1,0
	.section	.bss.overflowState,"aw",@nobits
	.type	overflowState, @object
	.size	overflowState, 2
overflowState:
	.skip 2,0
	.section	.bss.inPacket,"aw",@nobits
	.type	inPacket, @object
	.size	inPacket, 1
inPacket:
	.skip 1,0
	.section	.bss.rxBuf,"aw",@nobits
	.type	rxBuf, @object
	.size	rxBuf, 16
rxBuf:
	.skip 16,0
	.section	.bss.rxHead,"aw",@nobits
	.type	rxHead, @object
	.size	rxHead, 1
rxHead:
	.skip 1,0
	.section	.bss.rxTail,"aw",@nobits
	.type	rxTail, @object
	.size	rxTail, 1
rxTail:
	.skip 1,0
	.section	.bss.txBuf,"aw",@nobits
	.type	txBuf, @object
	.size	txBuf, 16
txBuf:
	.skip 16,0
	.section	.bss.txHead,"aw",@nobits
	.type	txHead, @object
	.size	txHead, 1
txHead:
	.skip 1,0
	.section	.bss.txTail,"aw",@nobits
	.type	txTail, @object
	.size	txTail, 1
txTail:
	.skip 1,0
	.section	.bss.usiTwiOnStartFunction,"aw",@nobits
	.type	usiTwiOnStartFunction, @object
	.size	usiTwiOnStartFunction, 2
usiTwiOnStartFunction:
	.skip 2,0
	.section	.bss.usiTwiOnStopFunction,"aw",@nobits
	.type	usiTwiOnStopFunction, @object
	.size	usiTwiOnStopFunction, 2
usiTwiOnStopFunction:
	.skip 2,0
.global __do_clear_bss
