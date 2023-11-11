#include<stdio.h>
#include <math.h>
#define COSINE_SIMILARITY_VECTOR_SIZE 6

int Res[256][256];
float B[COSINE_SIMILARITY_VECTOR_SIZE];
int grayS[2];

void getGrayS(int* a,int* b){
    grayS[0] = round(0.29 * a[0] + 0.587 * a[1] + 0.114 * a[2]);
    grayS[1] = round(0.29 * b[0] + 0.587 * b[1] + 0.114 * b[2]);
}

void toGLCM(int*** fromPicture, int height, int width){
    double sum = height*(width-1);
    for(int i=0;i<height;i++){
        for(int j=0;j<width-1;j++){
            getGrayS(fromPicture[i][j],fromPicture[i][j+1]);
            Res[grayS[0]][grayS[1]]++;
            Res[grayS[1]][grayS[0]]++;
        }
    }
    //  for(int i=0;i<256;i++){
    //      for(int j=0;j<256;j++){
    //          Res[i][j] /= 2*sum;
    //      }
    //  }
}

void generateTexture(int sumElmt , float contrast, float dissimilarity, float homogeneity, float ASM, float entropy, float energy){
    int i, j;
    for(i=0;i<256;i++){
        for(j = 0; j < 256; j++){
            //denorm
            Res [i][j] /= 2*sumElmt;
            //calculating component
            contrast += Res[i][j] * (i-j) * (i-j);
            dissimilarity += Res[i][j] * abs(i-j);
            homogeneity += Res[i][j] / (1 + (i-j)*(i-j));
            ASM += Res[i][j] * Res[i][j];
            entropy += Res[i][j] * log(Res[i][j]);
        }
    }
    entropy = -entropy;
    energy = sqrt(ASM);
    B[0] = contrast;
    B[1] = dissimilarity;
    B[2] = homogeneity;
    B[3] = ASM;
    B[4] = entropy;
    B[5] = energy;

    //similarity = cosineSimilarity(A,B,COSINE_SIMILARITY_VECTOR_SIZE);
    //return 0;
}

void getTexture(int*** fromPicture, int pictHeight, int pictWidth){
    toGLCM(fromPicture,pictHeight,pictWidth);
    generateTexture(pictHeight*(pictWidth-1),0,0,0,0,0,0);
}
