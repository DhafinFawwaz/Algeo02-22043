#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <string.h>
#define HSV_HIST_SIZE 72
#define HSV_HIST_SIZE_FULL 1152

double normalizedRGB(double n)
{
    return (n / 255.0);
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
int getHValue(int R, int G, int B)
{
    double r = (double)R;
    double g = (double)G;
    double b = (double)B;
    double degVal;
    if (getDelta(r, g, b) == 0)
    {
        // printf("pass1\n");
        degVal = 0;
    }
    else if (getCmaxLoc(r, g, b) == 0)
    {

        // printf("pass2\n");
        degVal = 60 * fmod(((normalizedRGB(g) - normalizedRGB(b)) / getDelta(r, g, b)), 6);
        // printf("%lfxxx\n", degVal);
        // printf("%lfkkk\n", getDelta(r, g, b));
    }
    else if (getCmaxLoc(r, g, b) == 1)
    {

        // printf("pass3\n");
        degVal = 60 * (((normalizedRGB(b) - normalizedRGB(r)) / getDelta(r, g, b)) + 2);
    }
    else if (getCmaxLoc(r, g, b) == 2)
    {

        // printf("pass4\n");
        degVal = 60 * (((normalizedRGB(r) - normalizedRGB(g)) / getDelta(r, g, b)) + 4);
        // printf("%lfaa\n", getDelta(r, g, b));
        // printf("%lfaa\n", degVal);
    }

    if (degVal < 0)
    {
        degVal += 360;
    }

    if ((degVal > 315 && degVal <= 360) || degVal == 0)
    {
        // printf("pass\n");
        return 0;
    }
    else if (degVal > 0 && degVal <= 25)
    {
        // printf("pass\n");
        return 1;
    }
    else if (degVal > 25 && degVal <= 40)
    {
        // printf("pass\n");
        return 2;
    }
    else if (degVal > 40 && degVal <= 120)
    {
        // printf("pass\n");
        return 3;
    }
    else if (degVal > 120 && degVal <= 190)
    {
        // printf("pass\n");
        return 4;
    }
    else if (degVal > 190 && degVal <= 270)
    {
        // printf("pass\n");
        return 5;
    }
    else if (degVal > 270 && degVal <= 295)
    {
        // printf("pass\n");
        return 6;
    }
    else if (degVal > 295 && degVal <= 315)
    {
        // printf("pass\n");
        return 7;
    }
    else
    {
        printf("%lf\n", degVal);
        printf("Hgagal\n");
    }
}

// r, g, b NOT normalized
int getSValue(int R, int G, int B)
{
    double r = (double)R;
    double g = (double)G;
    double b = (double)B;
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
    else
    {
        printf("Sgagal\n");
    }
}

// r, g, b NOT normalized
int getVValue(int R, int G, int B)
{
    double r = (double)R;
    double g = (double)G;
    double b = (double)B;
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
    else
    {
        printf("[%lf", r);
        printf(", %lf", g);
        printf(", %lf]\n", b);

        printf("[%d", R);
        printf(", %d", G);
        printf(", %d]\n", B);

        printf("%lf\n", tempVal);
        printf("Vgagal\n");
    }
}

// R, G, B, NOT normalized
// void HSVtoHistElmt(int *Hist, int R, int G, int B)
// {
//     // printf("pass1\n");
//     int H, S, V;
//     H = getHValue(R, G, B);
//     S = getSValue(R, G, B);
//     V = getVValue(R, G, B);
//     // printf("pass2\n");
//     int idx = H * 9 + S * 3 + V;
//     // printf("pass3\n");
//     Hist[idx] += 1;
//     // printf("pass4\n");
// }

// // Ukuran image harus diketahui sebelum menggunakan HSVtoHistArray
// void HSVtoHistArray(int *Hist, int img_matrix_x, int img_matrix_y, int ***img_matrix)
// {
//     for (int i = 0; i < img_matrix_x; i++)
//     {
//         for (int j = 0; j < img_matrix_y; j++)
//         {
//             // printf("pass\n");
//             HSVtoHistElmt(Hist, img_matrix[i][j][0], img_matrix[i][j][1], img_matrix[i][j][2]);
//         }
//     }

//     for (int i = 0; i < HSV_HIST_SIZE; i++)
//     {
//         // colorHistogram[i] = 0;
//         printf("%d ", Hist[i]);
//     }
// }

int *getColorHistogram(int *matrix, int row, int col)
{
    int *colorHistogram;
    colorHistogram = (int *)malloc(sizeof(int) * HSV_HIST_SIZE_FULL + 5);
    if (colorHistogram == NULL)
    {
        printf("gagal maloc\n");
    }
    // printf("b1\n");
    // memset(colorHistogram, 0, sizeof(int) * HSV_HIST_SIZE_FULL);
    // printf("%d\n", sizeof(colorHistogram));
    for (int i = 0; i < HSV_HIST_SIZE_FULL; i++)
    {
        colorHistogram[i] = 0;
    }
    // printf("helo hehe\n");
    // printf("b2\n");

    int R, G, B;
    // int AAAA = 0;
    // HSVtoHistArray(colorHistogram, row, col, matrix);

    int foridx = 0;

    double rowcvrt = (double)row;
    double colcvrt = (double)col;
    int rowidx = floor(rowcvrt / 4);
    int colidx = floor(colcvrt / 4);
    // printf("b3\n");

    // printf("%d %d %lf %lf %d %d\n", row, col, rowcvrt, colcvrt, rowidx, colidx);
    int m = 0;
    int n = 0;

    for (int m = 0; m < 4; m++)
    {
        for (int n = 0; n < 4; n++)
        {
            for (int k = rowidx * m; k < rowidx * (m + 1); k++)
            {
                for (int j = colidx * n; j < colidx * (n + 1); j++)
                {
                    // printf("here1\n");
                    R = matrix[k * col * 3 + j * 3];
                    G = matrix[k * col * 3 + j * 3 + 1];
                    B = matrix[k * col * 3 + j * 3 + 2];
                    // printf("%d %d %d\n", R, G, B);
                    // printf("pass\n");
                    // printf("helo haha\n");
                    // printf("helo hahe\n");
                    // printf("pass1\n");
                    int H, S, V;
                    H = getHValue(R, G, B);
                    S = getSValue(R, G, B);
                    V = getVValue(R, G, B);
                    // printf("%d %d %d\n", H, S, V);
                    // printf("pass2\n");
                    int idx = foridx * HSV_HIST_SIZE + H * 9 + S * 3 + V;
                    // printf("%d---\n", idx);
                    // printf("pass3\n");
                    // printf("%didx222\n", idx);
                    // if (idx > 1151)
                    // {
                    //     printf("kelebihan\n");
                    //     return colorHistogram;
                    // }
                    colorHistogram[idx] += 1;
                    // if (colorHistogram[idx] < 0 || colorHistogram[idx] > 100000)
                    // {
                    //     printf("salah\n");
                    //     return colorHistogram;
                    // }
                    // printf("pass4\n");
                    // AAAA++;
                    // printf("%didx\n", idx);
                    // printf("%daaa\n", AAAA);
                    // printf("%d %d %d %d %d\n", m, n, k, j, foridx);
                    // break;
                }
            }
            foridx++;
        }
    }
    // printf("%d %d %lf %lf %d %d %d\n", row, col, rowcvrt, colcvrt, rowidx, colidx, foridx);
    return colorHistogram;
}

void free_ptr(int *arr)
{
    free(arr);
}