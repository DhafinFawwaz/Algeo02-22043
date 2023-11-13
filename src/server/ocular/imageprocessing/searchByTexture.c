#include <stdlib.h>
#include <stdio.h>
#include <math.h>
#define GLCM_SIZE 255
#define COSINE_SIMILARITY_VECTOR_SIZE 6

double Res[GLCM_SIZE][GLCM_SIZE];
int grayS[2];

void gestGrayS(int* a,int* b){
    grayS[0] = round(0.29 * a[0] + 0.587 * a[1] + 0.114 * a[2]);
    grayS[1] = round(0.29 * b[0] + 0.587 * b[1] + 0.114 * b[2]);
}

void toGLCM(int*** fromPicture, int height, int width){
    double sum = height*(width-1);
    for(int i=0;i<height;i++){
        for(int j=0;j<width-1;j++){
            getGrayS(fromPicture[i][j],fromPicture[i][j+1]);
            Res[grayS[0]][grayS[1]]+=1;
            Res[grayS[1]][grayS[0]]+=1;
        }
    }
    //  for(int i=0;i<256;i++){
    //      for(int j=0;j<256;j++){
    //          Res[i][j] /= 2*sum;
    //      }
    //  }
}

void generateTexture(int sumElmt , double contrast, double dissimilarity, double homogeneity, double ASM, double entropy, double energy, double* textureComponent){
    int i, j;
    for(i = 0 ; i < GLCM_SIZE ; i++){
        for(j = 0; j < GLCM_SIZE ; j++){
            //denorm
            Res [i][j] /= 2*sumElmt;
            //calculating component
            contrast += Res[i][j] * (i-j) * (i-j);
            dissimilarity += Res[i][j] * abs(i-j);
            homogeneity += Res[i][j] / (1 + (i-j)*(i-j));
            ASM += Res[i][j] * Res[i][j];
            if(Res[i][j] != 0) entropy += Res[i][j] * log(Res[i][j]);
        }
    }
    entropy = -entropy;
    energy = sqrt(ASM);
    textureComponent[0] = contrast;
    textureComponent[1] = dissimilarity;
    textureComponent[2] = homogeneity;
    textureComponent[3] = ASM;
    textureComponent[4] = entropy;
    textureComponent[5] = energy;

    //similarity = cosineSimilarity(A,B,COSINE_SIMILARITY_VECTOR_SIZE);
    //return 0;
}

double *getTextureComponents(int ***fromPicture, int pictHeight, int pictWidth)
{
    double *textureComponents;
    textureComponents = (double *)malloc(sizeof(double) * COSINE_SIMILARITY_VECTOR_SIZE);
    toGLCM(fromPicture,pictHeight,pictWidth);
    generateTexture(pictHeight*(pictWidth-1),0,0,0,0,0,0,textureComponents);
    return textureComponents;
}

void free_ptr(double *arr)
{
    free(arr);
}