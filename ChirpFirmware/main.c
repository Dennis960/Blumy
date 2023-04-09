#include <inttypes.h>
#include <avr/io.h>
#include <util/delay.h>
#include <avr/interrupt.h>
#include <avr/wdt.h>
#include <avr/sleep.h>
#include <avr/eeprom.h>
#include "usiTwiSlave.h"

#define FIRMWARE_VERSION 0x21 // 2.1

//------------ peripherals ----------------

#define LED_K PB0
#define LED_A PB1
#define BUZZER PA7

void inline ledOn()
{
    DDRB |= _BV(LED_A) | _BV(LED_K); // forward bias the LED
    PORTB &= ~_BV(LED_K);            // flash it to discharge the PN junction capacitance
    PORTB |= _BV(LED_A);
}

void inline ledOff()
{
    DDRB &= ~(_BV(LED_A) | _BV(LED_K));  // make pins inputs
    PORTB &= ~(_BV(LED_A) | _BV(LED_K)); // disable pullups
}

void inline initBuzzer()
{
    TCCR0A = 0; // reset timer1 configuration
    TCCR0B = 0;

    TCCR0A |= _BV(COM0B1); // Clear OC0B on Compare Match when up-counting. Set OC0B on Compare Match when down-counting.
    TCCR0A |= _BV(WGM00);  // PWM, Phase Correct, 8-bit
    TCCR0B |= _BV(CS00);   // start timer
}

void inline static beep()
{
    initBuzzer();
    OCR0B = 48;
    _delay_ms(42);
    TCCR0B = 0; // stop timer
    PORTA &= ~_BV(BUZZER);
}

void static chirp(uint8_t times)
{
    PRR &= ~_BV(PRTIM0);
    while (times-- > 0)
    {
        beep();
        _delay_ms(40);
    }
    PRR |= _BV(PRTIM0);
}

static inline void playHappy()
{
    chirp(9);
    _delay_ms(350);
    chirp(1);
    _delay_ms(50);
    chirp(1);
}

static inline void playUnhappy()
{
    chirp(3);
}

//------------------- initialization/setup-------------------

static inline void inline setupGPIO()
{
    PORTA |= _BV(PA0); // nothing
    PORTA &= ~_BV(PA0);
    PORTA |= _BV(PA2); // nothing
    PORTA &= ~_BV(PA2);
    PORTA |= _BV(PA3); // nothing
    PORTA &= ~_BV(PA3);
    DDRA |= _BV(PA7); // nothing
    PORTA &= ~_BV(PA7);

    DDRB |= _BV(PB0); // nothing
    PORTB &= ~_BV(PB0);
    DDRB |= _BV(PB1); // nothing
    PORTB &= ~_BV(PB1);
    DDRB |= _BV(PB2); // sqare wave output
    PORTB &= ~_BV(PB2);
}

//--------------- sleep / wakeup routines --------------

void inline sleepWhileADC()
{
    set_sleep_mode(SLEEP_MODE_ADC);
    //    while(1) {
    sleep_mode();
    //    }
}

ISR(ADC_vect)
{
    // nothing, just wake up
}

// ------------------ capacitance measurement ------------------

static inline void startExcitationSignal()
{
    OCR0A = 0;
    TCCR0A = _BV(COM0A0) | // Toggle OC0A on Compare Match
             _BV(WGM01);   // reset timer to 0 on Compare Match
    TCNT0 = 254;
    TCCR0B = _BV(CS00);
}

void stopExcitationSignal() {
	TCCR0B = 0;
	TCCR0A = 0;
    PORTB &= ~_BV(PB2);
}

static inline void initADC()
{
    ADCSRA |= _BV(ADPS2); // adc clock speed = sysclk/16
    ADCSRA |= _BV(ADIE);
    ADCSRA |= _BV(ADEN);
}

static inline uint16_t getADC1()
{
    ADMUX = _BV(MUX0); // select ADC1 as input

    ADCSRA |= _BV(ADSC); // start conversion

    sleepWhileADC();

    uint16_t result = ADCL;
    result |= ADCH << 8;

    return 1023 - result;
}

uint16_t getCapacitance() {    
    PRR &= ~_BV(PRTIM0);
	startExcitationSignal();

    getADC1();
    _delay_ms(1000); // stabilize delay
    uint16_t result = getADC1();
    
    stopExcitationSignal();
    PORTB &= ~_BV(PB2);
    PRR |= _BV(PRTIM0);

    return result;
}

// ------------------ temperature measurement ------------------

uint16_t getADC8()
{
    ADMUX = 0b10100010; // select ADC8 as input, internal 1.1V Vref

    ADCSRA |= _BV(ADSC); // start conversion

    sleepWhileADC();

    uint16_t result = ADCL;
    result |= ADCH << 8;

    return result;
}

static inline uint16_t getTemperature()
{
    getADC8(); // discard the first measurement
    return getADC8();
}

//--------------------- light measurement --------------------

volatile uint16_t light = 0;
volatile uint16_t lightCounter = 0;
volatile uint8_t lightCycleOver = 1;

static inline stopLightMeaseurement()
{
    GIMSK &= ~_BV(PCIE1);
    TCCR1B = 0;
    PCMSK1 &= ~_BV(PCINT8);
    TIMSK1 &= ~_BV(TOIE1);

    lightCycleOver = 1;
}

ISR(PCINT1_vect)
{
    GIMSK &= ~_BV(PCIE1); // disable pin change interrupts
    TCCR1B = 0;           // stop timer
    lightCounter = TCNT1;
    light = lightCounter;

    stopLightMeaseurement();
}

ISR(TIM1_OVF_vect)
{
    lightCounter = 65535;
    light = lightCounter;

    stopLightMeaseurement();
}

static inline uint16_t getLight()
{
    TIMSK1 |= _BV(TOIE1); // enable timer overflow interrupt

    DDRB |= _BV(LED_A) | _BV(LED_K); // forward bias the LED
    PORTB &= ~_BV(LED_K);            // flash it to discharge the PN junction capacitance
    PORTB |= _BV(LED_A);

    PORTB |= _BV(LED_K); // reverse bias LED to charge capacitance in it
    PORTB &= ~_BV(LED_A);

    DDRB &= ~_BV(LED_K);                 // make Cathode input
    PORTB &= ~(_BV(LED_A) | _BV(LED_K)); // disable pullups

    TCNT1 = 0;
    TCCR1A = 0;
    TCCR1B = _BV(CS11) | _BV(CS10); // start timer1 with prescaler clk/64

    PCMSK1 |= _BV(PCINT8); // enable pin change interrupt on LED_K
    GIMSK |= _BV(PCIE1);

    lightCycleOver = 0;
}

static inline uint8_t lightMeasurementInProgress()
{
    return !lightCycleOver;
}

// ----------------- sensor mode loop ---------------------

#define I2C_GET_CAPACITANCE 0x00
#define I2C_SET_ADDRESS 0x01
#define I2C_GET_ADDRESS 0x02
#define I2C_MEASURE_LIGHT 0x03
#define I2C_GET_LIGHT 0x04
#define I2C_GET_TEMPERATURE 0x05
#define I2C_RESET 0x06
#define I2C_GET_VERSION 0x07
#define I2C_CHIRP_HAPPY 0x08
#define I2C_CHIRP_UNHAPPY 0x09
#define I2C_LED_ON 0x0A
#define I2C_LED_OFF 0x0B

#define reset()            \
    wdt_enable(WDTO_15MS); \
    while (1)              \
    {                      \
    }

static inline void loopSensorMode()
{
    startExcitationSignal();
    uint16_t currCapacitance = 0;
    uint16_t temperature = 0;

    while (1)
    {
        if (usiTwiDataInReceiveBuffer())
        {
            uint8_t usiRx = usiTwiReceiveByte();

            if (I2C_GET_CAPACITANCE == usiRx)
            {
                currCapacitance = getCapacitance();
                usiTwiTransmitByte(currCapacitance >> 8);
                usiTwiTransmitByte(currCapacitance & 0x00FF);
            }
            else if (I2C_SET_ADDRESS == usiRx)
            {
                uint8_t newAddress = usiTwiReceiveByte();
                if (newAddress >= 0 && newAddress <= 127)
                {
                    eeprom_write_byte((uint8_t *)0x01, newAddress);
                }
            }
            else if (I2C_GET_ADDRESS == usiRx)
            {
                uint8_t newAddress = eeprom_read_byte((uint8_t *)0x01);
                usiTwiTransmitByte(newAddress);
            }
            else if (I2C_MEASURE_LIGHT == usiRx)
            {
                if (!lightMeasurementInProgress())
                {
                    getLight();
                }
            }
            else if (I2C_GET_LIGHT == usiRx)
            {
                GIMSK &= ~_BV(PCIE1); // disable pin change interrupts
                TCCR1B = 0;           // stop timer

                usiTwiTransmitByte(light >> 8);
                usiTwiTransmitByte(light & 0x00FF);

                GIMSK |= _BV(PCIE1);
                TCCR1B = _BV(CS11) | _BV(CS10); // start timer1 with prescaler clk/64
            }
            else if (I2C_GET_TEMPERATURE == usiRx)
            {
                temperature = getTemperature();
                usiTwiTransmitByte(temperature >> 8);
                usiTwiTransmitByte(temperature & 0x00FF);
            }
            else if (I2C_RESET == usiRx)
            {
                reset();
            }
            else if (I2C_GET_VERSION == usiRx)
            {
                usiTwiTransmitByte(FIRMWARE_VERSION);
            }
            else if (I2C_CHIRP_HAPPY == usiRx)
            {
                playHappy();
            }
            else if (I2C_CHIRP_UNHAPPY == usiRx)
            {
                playUnhappy();
            }
            else if (I2C_LED_ON == usiRx)
            {
                ledOn();
            }
            else if (I2C_LED_OFF == usiRx)
            {
                ledOff();
            }
        }
    }
}

//-----------------------------------------------------------------

#define I2C_ADDRESS_EEPROM_LOCATION (uint8_t *)0x01
#define I2C_ADDRESS_DEFAULT 4

int main(void)
{
    MCUSR = 0;
    wdt_disable();
    setupGPIO();
    initADC();

    uint8_t address = eeprom_read_byte(I2C_ADDRESS_EEPROM_LOCATION);
    if (address <= 0 || address >= 127) // if eeprom address is 127 or 0, use default address
    {
        address = I2C_ADDRESS_DEFAULT;
    }
    usiTwiSlaveInit(address);

    CLKPR = _BV(CLKPCE);
    CLKPR = _BV(CLKPS1); // clock speed = clk/4 = 2Mhz

    sei();

    loopSensorMode();
}