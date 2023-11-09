#include <math.h>
#define GLCM_SIZE 255
#define COSINE_SIMILARITY_VECTOR_SIZE 6

int contrast = 0;
int dissimilarity = 0;
int homogeneity = 0;
int ASM = 0;
int energy = 0;
int entropy = 0;

int M[GLCM_SIZE][GLCM_SIZE];
int levels = GLCM_SIZE;

double similarity = 0;

int test(int a){
    return a*4;
}


double cosineSimilarity(int *A, int *B, int vectorSize){
    double dotProduct = 0.0;
    double normA = 0.0;
    double normB = 0.0;
    int i = 0;
    for(i = 0; i < vectorSize; i++){
        dotProduct += A[i] * B[i];
        normA += A[i] * A[i];
        normB += B[i] * B[i];
    }
    return dotProduct / (sqrt(normA) * sqrt(normB));
}
int generateSomething(){

    int i = 0;
    for(i = 0; i < GLCM_SIZE*GLCM_SIZE; i++){
        int x = i/GLCM_SIZE;
        int y = i%GLCM_SIZE;
        contrast += M[x][y] * (x-y) * (x-y);
        dissimilarity += M[x][y] * abs(x-y);
        homogeneity += M[x][y] / (1 + (x-y)*(x-y));
        ASM += M[x][y] * M[x][y];
        entropy += M[x][y] * log(M[x][y]);
    }
    entropy = -entropy;
    energy = sqrt(ASM);

    int A[COSINE_SIMILARITY_VECTOR_SIZE];
    int B[COSINE_SIMILARITY_VECTOR_SIZE];

    similarity = cosineSimilarity(A,B,COSINE_SIMILARITY_VECTOR_SIZE);

    return 0;
}