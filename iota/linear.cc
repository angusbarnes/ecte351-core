#include <stdio.h>
#include <stdlib.h>

// Create variables
double output_low, output_high, mapped_low, mapped_high;
double range_output, range_mapped;
double forward, reverse;
double output_increments;

int main(void) {
  
  // initialise variables
  output_low = -255.0, output_high = 255.0; 
  mapped_low = -25, mapped_high = 25;
  forward = 0, reverse = 0;
  range_output = 0, range_mapped = 0;
  output_increments = 0;

  // Calculate the ranges
  range_output = output_high - output_low;
  range_mapped = mapped_high - mapped_low;

  // Forward transform coefficient
  forward = range_mapped / range_output;
  // Reverse transform coefficient
  reverse = range_output / range_mapped;
  // Calculate the number of increments requried at the output
  output_increments = range_output / forward;
  
  // Print the coefficients
  printf("Forward coefficient %lf\n", forward);
  printf("Number of increments %lf\n", output_increments);
  printf("Reverse coefficient %lf\n", reverse);
 
  return 0;
}