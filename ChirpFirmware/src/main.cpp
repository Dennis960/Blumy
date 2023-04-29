#include <Arduino.h>
#include <inttypes.h>
#include <avr/io.h>
#include <util/delay.h>
#include <avr/interrupt.h>
#include <avr/wdt.h>
#include <avr/sleep.h>
#include "usiTwiSlave.h"

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

static inline void setupGPIO()
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

void stopExcitationSignal()
{
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

uint16_t getCapacitance()
{
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

// ----------------- sensor mode loop ---------------------

#define I2C_GET_CAPACITANCE 0x00
#define I2C_RESET 0x01
#define I2C_CHIRP_HAPPY 0x02
#define I2C_CHIRP_UNHAPPY 0x03
#define I2C_LED_ON 0x04
#define I2C_LED_OFF 0x05

#define reset()            \
    wdt_enable(WDTO_15MS); \
    while (1)              \
    {                      \
    }

static inline void loopSensorMode()
{
    startExcitationSignal();
    uint16_t currCapacitance = 0;

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
            else if (I2C_RESET == usiRx)
            {
                reset();
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

#define I2C_ADDRESS_DEFAULT 1

void setup()
{
    MCUSR = 0;
    wdt_disable();
    setupGPIO();
    initADC();

    usiTwiSlaveInit(I2C_ADDRESS_DEFAULT);

    CLKPR = _BV(CLKPCE);
    CLKPR = _BV(CLKPS1); // clock speed = clk/4 = 2Mhz

    sei();

    loopSensorMode();
}
void loop()
{
}