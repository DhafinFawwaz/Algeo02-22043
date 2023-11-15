#include <stdlib.h>
#include <stdio.h>
#include <math.h>
#define GLCM_SIZE 255
#define COSINE_SIMILARITY_VECTOR_SIZE 6

double Res[GLCM_SIZE][GLCM_SIZE];

int getGrayS(int r, int g, int b)
{
    return (round(0.29 * r + 0.587 * g + 0.114 * b));
}

void toGLCM(int *fromPicture, int height, int width)
{
    int cidx1, cidx2, val1, val2;
    for (int i = 0; i < height; i++)
    {
        for (int j = 0; j < width - 1; j++)
        {
            cidx1 = i * width * 3 + j * 3;
            cidx2 = i * width * 3 + (j + 1) * 3;
            val1 = getGrayS(fromPicture[cidx1], fromPicture[cidx1 + 1], fromPicture[cidx1 + 2]);
            val2 = getGrayS(fromPicture[cidx2], fromPicture[cidx2 + 1], fromPicture[cidx2 + 2]);
            Res[val1][val2] += 1;
            Res[val2][val1] += 1;
        }
    }
}

void generateTexture(int sumElmt , double contrast, double dissimilarity, double homogeneity, double ASM, double entropy, double energy, double* textureComponent, int pictHeight, int pictWidth){
    int i, j;
    double forDenorm;
    for(i = 0 ; i < GLCM_SIZE ; i++){
        for(j = 0; j < GLCM_SIZE ; j++){
            //denorm
            Res [i][j] /= 2*sumElmt;
            //calculating component
            contrast += Res[i][j] * (i-j) * (i-j);
            dissimilarity += Res[i][j] * abs(i-j);
            homogeneity += Res[i][j] / (1 + (i-j)*(i-j));
            ASM += Res[i][j] * Res[i][j];
            if (Res[i][j] != 0)
                entropy += Res[i][j] * log(Res[i][j]);
        }
    }
    entropy = -entropy;
    energy = sqrt(ASM);
    forDenorm = 255*255*(pictHeight)*(pictWidth-1);
    textureComponent[0] = contrast / forDenorm;
    forDenorm = 255*(pictHeight)*(pictWidth-1);
    textureComponent[1] = dissimilarity / forDenorm;
    forDenorm = (pictHeight)*(pictWidth-1);
    textureComponent[2] = homogeneity / forDenorm;
    forDenorm *= forDenorm;
    textureComponent[3] = ASM / forDenorm;
    forDenorm = (pictHeight)*(pictWidth-1) * log((pictHeight)*(pictWidth-1));
    textureComponent[4] = entropy / forDenorm;
    forDenorm = (pictHeight)*(pictWidth-1);
    textureComponent[5] = energy / forDenorm;

    // similarity = cosineSimilarity(A,B,COSINE_SIMILARITY_VECTOR_SIZE);
    // return 0;
}

double *getTextureComponents(int *fromPicture, int pictHeight, int pictWidth)
{
    double *textureComponents;
    textureComponents = (double *)malloc(sizeof(double) * COSINE_SIMILARITY_VECTOR_SIZE);
    toGLCM(fromPicture,pictHeight,pictWidth);
    generateTexture(pictHeight*(pictWidth-1),0,0,0,0,0,0,textureComponents,pictHeight,pictWidth);
    return textureComponents;
}

void free_ptr(double *arr)
{
    free(arr);
}