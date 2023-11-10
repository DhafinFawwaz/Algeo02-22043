#include <math.h>
#define HSV_HIST_SIZE 72

double normalizedRGB(double n)
{
    return (n / 255);
}

// r, g, b normalized
double getCmax(double r, double g, double b)
{
    return fmax(fmax(r, g), b);
}

// r, g, b normalized
double getCmin(double r, double g, double b)
{
    return fmin(fmin(r, g), b);
}

int getCmaxLoc(double r, double g, double b)
{
    if (getCmax(r, g, b) == r)
    {
        return 0;
    }
    else if (getCmax(r, g, b) == g)
    {
        return 1;
    }
    else if (getCmax(r, g, b) == b)
    {
        return 2;
    }
}

// r, g, b NOT normalized
double getDelta(double r, double g, double b)
{
    return (getCmax(normalizedRGB(r), normalizedRGB(g), normalizedRGB(b)) - getCmin(normalizedRGB(r), normalizedRGB(g), normalizedRGB(b)));
}

// r, g, b NOT normalized
int getHValue(double r, double g, double b)
{
    double degVal;
    if (getDelta(r, g, b) == 0)
    {
        degVal = 0;
    }
    else if (getCmaxLoc(r, g, b) == 0)
    {
        degVal = 60 * fmod(((normalizedRGB(g) - normalizedRGB(b)) / getDelta(r, g, b)), 6);
    }
    else if (getCmaxLoc(r, g, b) == 1)
    {
        degVal = 60 * ((normalizedRGB(b) - normalizedRGB(r)) / getDelta(r, g, b)) + 2;
    }
    else if (getCmaxLoc(r, g, b) == 2)
    {
        degVal = 60 * ((normalizedRGB(r) - normalizedRGB(g)) / getDelta(r, g, b)) + 4;
    }

    if (degVal > 316 && degVal <= 360)
    {
        return 0;
    }
    else if (degVal > 0 && degVal <= 25)
    {
        return 1;
    }
    else if (degVal > 25 && degVal <= 40)
    {
        return 2;
    }
    else if (degVal > 40 && degVal <= 120)
    {
        return 3;
    }
    else if (degVal > 120 && degVal <= 190)
    {
        return 4;
    }
    else if (degVal > 190 && degVal <= 270)
    {
        return 5;
    }
    else if (degVal > 270 && degVal <= 295)
    {
        return 6;
    }
    else if (degVal > 295 && degVal <= 315)
    {
        return 7;
    }
}

// r, g, b NOT normalized
int getSValue(double r, double g, double b)
{
    double tempVal;
    if (getCmax(normalizedRGB(r), normalizedRGB(g), normalizedRGB(b)) == 0)
    {
        tempVal = 0;
    }
    else
    {
        tempVal = (getDelta(r, g, b) / getCmax(normalizedRGB(r), normalizedRGB(g), normalizedRGB(b)));
    }

    if (tempVal >= 0 && tempVal < 0.2)
    {
        return 0;
    }
    else if (tempVal >= 0.2 && tempVal < 0.7)
    {
        return 1;
    }
    else if (tempVal >= 0.7 && tempVal <= 1)
    {
        return 2;
    }
}

// r, g, b NOT normalized
int getVValue(double r, double g, double b)
{
    double tempVal = getCmax(normalizedRGB(r), normalizedRGB(g), normalizedRGB(b));

    if (tempVal >= 0 && tempVal < 0.2)
    {
        return 0;
    }
    else if (tempVal >= 0.2 && tempVal < 0.7)
    {
        return 1;
    }
    else if (tempVal >= 0.7 && tempVal <= 1)
    {
        return 2;
    }
}

// R, G, B, NOT normalized
void HSVtoHistElmt(int *Hist, int R, int G, int B)
{
    int H, S, V;
    H = getHValue(R, G, B);
    S = getSValue(R, G, B);
    V = getVValue(R, G, B);
    int idx = H * 8 + S * 3 + V;
    Hist[idx] += 1;
}

// Ukuran image harus diketahui sebelum menggunakan HSVtoHistArray
void HSVtoHistArray(int *Hist, int *img_matrix_x, int *img_matrix_y, int ***img_matrix)
{
    for (int i = 0; i < img_matrix_x; i++)
    {
        for (int j = 0; j < img_matrix_y; j++)
        {
            HSVtoHistElmt(Hist, img_matrix[i][j][0], img_matrix[i][j][1], img_matrix[i][j][2]);
        }
    }
}